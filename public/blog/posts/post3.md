---
title: "Concurrent Model Inference Request Processing In Kronk"
date: "2026-03-30"
slug: "concurrent-model-inference-request-processing-in-kronk"
excerpt: "Learn how concurrent model inference works in Kronk."
author: "bill-kennedy"
banner: "/blog/images/post3_banner.jpg"
ogImage: "/blog/images/post3_twitter.jpg"
---

## Introduction

When you run an LLM locally, the default setup handles one request at a time. You send a prompt, the model generates a response, and while that's happening, any other request has to wait. For a single person chatting with a model, that's fine. But the moment you have multiple users, an agentic application firing parallel tool calls, or a batch of prompts to process, that single-request bottleneck becomes a real problem.

Kronk solves this with a batch engine that lets the GPU process multiple requests simultaneously. The key to all of it is a single configuration parameter called `NSeqMax`. In this post, I'll break down what `NSeqMax` does and how the batch engine uses slots and sequences to support concurrent processing. By the end, you'll understand how to tune this setting for your workload — whether that's a personal chat session or a multi-user API server.

_Note: For the rest of the article, I will assume that you are using at least one GPU to run Kronk. However, everything here is applicable to using a CPU or a hybrid GPU/CPU, and I’ll use the term GPU interchangeably with these other modes._

## What is NSeqMax?

`NSeqMax` controls how many requests a model can process concurrently (out of order execution), but don’t think of this concurrency in terms of threads and cores. Concurrency comes in feeding the GPU with a tray of tokens that contain a small sample of tokens from the different active requests. With each tray that is processed, the batch engine creates the illusion multiple requests are being processed at the same time.

The batch engine does this with the concept of a slot, where a request is assigned to a slot for processing. Each value of `NSeqMax` creates a slot, and the more slots, the more requests can have tokens pulled into the tray at the same time for the GPU to process all at once. When there are more requests than slots, then those new requests have to wait for a slot to become available.

![slots](/blog/images/post3_image1.png)

The trade-off in creating lots of slots is VRAM (Video RAM) usage. Each slot reserves a unique partition of memory from the KV caching system and all this memory has to be pre-allocated when you load the model for the first time.

Imagine if each KV cache partition you need to allocate per slot is 3 GB. If you want to use 4 slots, that's 12 GB of VRAM just for the KV cache. More slots means more concurrency, but it also means more VRAM.

Read the [previous post](https://www.kronkai.com/blog/understanding-the-kronk-vram-calculator) to understand more about the memory requirements for using a model and the KV cache.

## Slot and Sequence Details

The batch engine in Kronk divides its capacity into two things: slots and sequences. Together they provide the mechanism for processing multiple requests concurrently while keeping each request's data isolated inside the shared KV cache.

**Slots** are the processing units that handle individual requests. Each slot tracks its own state: prompt tokens, decode position, sampler configuration, and response channel. Think of a slot as a workstation — it has everything needed to handle one request from start to finish.

**Sequences** are isolated partitions in the shared KV cache. Each slot is assigned a unique sequence ID, ensuring that one request's [attention state](https://www.ibm.com/think/topics/attention-mechanism) never interferes with another's. The KV cache is shared memory, but the sequence IDs act as walls between partitions.

The mapping is always 1:1 — each slot gets exactly one sequence:

```
NSeqMax = 4

Slot 0  →  Sequence 0  →  KV cache partition 0
Slot 1  →  Sequence 1  →  KV cache partition 1
Slot 2  →  Sequence 2  →  KV cache partition 2
Slot 3  →  Sequence 3  →  KV cache partition 3
```

You could think of this in terms of how every OS thread is assigned its own stack. Each thread uses its own stack to execute code and threads shouldn’t share their stack memory between each other, that memory needs to stay partitioned from each other. In this scenario, a slot is a thread and a sequence is the stack.

This design means that when Slot 0 is generating a response about cooking recipes and Slot 1 is answering a question about quantum physics, neither one can see or be influenced by the other's tokens. They share the same GPU and the same model weights (knobs), but their conversation state is completely separate.

## How Batch Processing Works

Now that you understand what slots and sequences are, I want to share how the batch engine actually processes requests.

### The Request Flow

Each request moves through the batch engine in these stages:

1. **Queue** — The request enters a bounded queue that holds up to `NSeqMax × 2` requests. With `NSeqMax=4`, up to 8 requests can be in-flight: 4 actively processing in slots and 4 waiting in the queue.

2. **Assign** — An available slot picks up the request from the queue.

3. **Prefill** — The prompt tokens are processed through the model. This is where the model "reads" and understands the input before it starts generating.

4. **Decode** — The model generates tokens one at a time, streaming them back to the client.

5. **Complete** — The slot is released and made available for the next request.

### The Work Tray and The GPU

When the model processes tokens, it doesn't handle them all at once. Two parameters control how tokens are batched and fed to the GPU:

- **`NBatch`** is the capacity of the work tray — the maximum number of tokens you can load before handing them to the GPU. When the batch engine is running multiple slots in parallel, all their tokens share this tray. The Kronk default is 2048.

- **`NUBatch`** is the GPU's bite size — when the tray arrives at the GPU, it chews through tokens in `NUBatch`-sized bites. This is a hardware optimization: different GPUs have different optimal bite sizes based on their memory architecture. The Kronk default is 512.

For example, if you send a 4096-token prompt with `NBatch: 2048` and `NUBatch: 512`, the prompt is split into 2 decode calls of 2048 tokens each. Within each call, the GPU processes 512 tokens at a time — so each call runs 4 compute passes internally.

## How Parallel Batch Processing Works

When multiple slots are active at the same time, the batch engine doesn't process them one after another — it combines their work into a single tray as we already discussed. Here are more details.

### Decode Phase: All Slots in One Pass

During the decode (generation) phase, each active slot produces one token per iteration. The batch engine collects the next token from every active slot and puts them all on the work tray together. The GPU then processes all of those tokens in a single forward pass.

With NSeqMax=4 and all four slots actively generating, the GPU processes 4 tokens per forward pass instead of 1. The compute cost of one forward pass with 4 tokens is only slightly more than a forward pass with 1 token, because the GPU must load the model weights (knobs) into its compute units regardless of batch size — so that memory bandwidth cost is amortized across all 4 tokens. The per-token cost drops significantly compared to running 4 separate single-token passes.

### Prefill Phase: Round-Robin Fair Sharing

Prefill is different from decode. During prefill, each slot may have hundreds or thousands of prompt tokens to process. If the batch engine let one slot dump all of its tokens onto the tray first, the other slots would be starved — they'd sit idle waiting for that one large prompt to finish.

To prevent this, the batch engine uses `NUBatch` as a round-robin chunk size during prefill. It works like this:

1. Add generation tokens from all active slots (1 token each — these always fit).
2. Round-robin prefill: pull `NUBatch` tokens from each prefilling slot in turn until the tray reaches `NBatch` capacity.
3. Hand the tray to the GPU.
4. GPU processes the tray in `NUBatch`-sized bites.

For example, with 4 prefilling slots, `NBatch: 4096`, and `NUBatch: 512`,
each round pulls 512 tokens from S1, S2, S3, S4, and then back
to S1 until the tray is full. In this example, each slot adds 1024 tokens into the tray instead of one slot adding 4096 tokens and leaving all the other slots waiting to have their turn.

![slots](/blog/images/post3_image1.png)

This fair sharing means that even when a massive prompt is being processed in one slot, the other slots are still making progress. No single request can starve the others.

## Choosing the Right NSeqMax

The right value depends on how you're using the model:

| Workload                   | Recommended NSeqMax | Why                                        |
| -------------------------- | ------------------- | ------------------------------------------ |
| Single user, interactive   | 1-2                 | Low latency, minimal VRAM overhead         |
| Multi-user API server      | 4-8                 | Good throughput without saturating the GPU |
| High-throughput batch jobs | 8-16                | Maximum concurrency for offline processing |

Higher `NSeqMax` gives you better throughput — more requests completed per unit of time — but individual requests may take slightly longer because they share the GPU. Lower `NSeqMax` gives lower per-request latency but less concurrent capacity. The goal is to find the balance point where you have enough concurrency for your users without saturating the GPU or running out of VRAM.

If you're seeing requests queue up (which you can observe through the integrated OpenTelemetry tracing capabilities — look for long `queue-wait` spans), consider increasing `NSeqMax` if your VRAM allows it. If VRAM is tight, you can reduce the `context_window` or use `q8_0` KV cache quantization to make room for more slots.

## Conclusion

The batch engine is at the core of how Kronk handles concurrency. `NSeqMax` is the single parameter that controls it — set it to 1 and requests are processed sequentially, set it higher and multiple requests generate tokens in parallel through a shared GPU forward pass.

The key concepts to remember are: slots are the processing units that handle requests, sequences are the isolated KV cache partitions that keep requests from interfering with each other, and the batch engine combines tokens from all active slots into a single tray that the GPU processes in one pass. The round-robin prefill strategy ensures no single large prompt can starve other slots, and the bounded queue with backpressure prevents the system from being overwhelmed.

The trade-off is always VRAM. Each slot reserves its full KV cache partition upfront, so more concurrency means more memory. Use the VRAM calculator to find the right balance for your hardware before you commit to a configuration. Start with a low `NSeqMax`, verify the model fits, and increase it until you've found the throughput sweet spot for your workload.
