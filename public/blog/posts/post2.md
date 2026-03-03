---
title: "Using The VRAM Calculator"
date: "2026-03-04"
slug: "using-the-vram-calculator-in-kronk"
excerpt: "Learn how to use the VRAM calculator to know exactly how much memory you need to run a model in Kronk."
author: "bill-kennedy"
banner: "/blog/images/post2_banner.jpg"
ogImage: "/blog/images/post2_twitter.jpg"
---

In the first post "Navigating Hugging Face For Kronk", I discussed how model architectures and model types affect how a model will run on the hardware you have. The three different architectures Dense, Mixture of Experts (MoE), and Hybrid, plus model types like Q8_0 vs Q8_K_XL all behave differently and are tuned in different ways. Memory is going to be your first big obstacle. You basically won't be able to use a model that is larger than 80% of the total memory you have on the machine if you are using Apple Silicon (unified memory). For systems that have separate CPU and GPU memory, you are free to use all of the GPU memory, but if some of the model will run on CPU, I like the 80% rule again.

In this post, I'm going to talk about the VRAM calculator which will tell you exactly how much memory you need to fit a model entirely inside your GPU. When your GPU and CPU memory are separated, I'll share with you some settings that will let you run some layers of the model (MoE base models) on the CPU to allow you to run larger models. Dense models have to fit 100% in your GPU memory. When you are using a Hybrid model, you need to know if it's Dense or MoE to know what options you have.

## VRAM Algorithm

Let's start with the algorithm and then I will show you how to get all the values you need to use the algorithm.

Here is the most basic form of the algorithm:

`Total VRAM = Model Weights + KV Cache`

The `Model Weights` in the algorithm represent the learnable numerical parameter values that the model has acquired through training to understand language patterns, relationships, and knowledge. In LLMs, these weights are stored inside the model file and represent the connections between neurons across all layers of the model's neural network. The model weights essentially encode the model's "memory" and intelligence, which allows it to determine how input tokens are processed and transformed into meaningful outputs.

All these weights in a Dense and some Hybrid models need to be loaded into the GPU's memory. In MoE models, only certain layers need to be loaded at any given time. This is why the size of the model is important to know, since it represents the size of the model weights.

The `KV Cache` in the algorithm represents the amount of memory to be used for processing inference through the model. This parameter in the algorithm is completely configurable by you and is made up of 4 parts:

- **Context window size**: Larger context = larger KV cache (linear relationship)

- **KV cache quantization**: Options like `f16` (16-bit) vs `q8_0` (8-bit) reduce memory usage

- **Number of concurrent sequences**: More parallel requests = more KV caches

- **Batch sizes**: Affects how much cache is allocated per request

## Slots and Sequences

Slots and sequences are at the core of everything that happens in Kronk to perform inference. However, different model servers handle the concept of slots and sequences differently. How they use them are diffrent depending on the optimization they want to provide or the amount of parallelism they want to support. This is no different in Kronk, so before I start to explain this, I need to provide a bit of a disclaimer.

### Disclaimer

Slots and sequences are llama.cpp specific terms, though the underlying concepts have equivalents in other serving systems.

When using Kronk this is what slots and sequences are:

- **Slot** - A persistent slot that holds state (prompt, KV cache) for a sequence
- **Sequence** - A batch of tokens being processed within a slot

For other serving systems these are equivalant terms:

- **vLLM**: Uses "Request" or "RequestPool" - each request has its own sequence with its own KV cache
- **_sglang_**: Uses "Request" - manages multiple requests with their own KV caches
- **TGI (Text Generation Inference)**: Uses "Request" or "Batch"

The core concept (each request needs its own KV cache storage) is universal across all LLM serving systems - it's just the naming that differs. vLLM and sglang achieve better batch efficiency through continuous batching (paged attention), while llama.cpp uses a simpler fixed-slot approach.

_Note: That doesn't mean this calculator is only useful when running models in Kronk, it just means you might need more information to make an accurate calculation for another system._

### Kronk's Use of Slots and Sequences

A slot is a processing unit that handles one request at a time. Each slot is assigned a unique sequence ID that maps to an isolated partition in the shared KV cache. The mapping is always 1 to 1 in Kronk.

DIAGRAM HERE
Slot 0 → Sequence 0 → KV cache partition 0
Slot 1 → Sequence 1 → KV cache partition 1
Slot 2 → Sequence 2 → KV cache partition 2
Slot 3 → Sequence 3 → KV cache partition 3

NSeqMax controls how many slots (and sequences) are created. In the diagram above, NSeqMax is set to 4 so Kronk will create 4 slots each with their own sequence to a KV cache partition. More slots means more concurrent requests, but each slot reserves its own KV cache partition in VRAM whether or not it's actively used.

### What Affects KV Cache Memory Per Sequence

Each sequence's KV cache partition size is determined these factors:

**1. Context Window (n_ctx)**  
The maximum number of tokens the sequence can hold. Larger context windows linearly increase memory. 32K context uses 4× the memory of 8K context.

**2. Number of Layers (block_count)**  
Every transformer layer stores its own key and value tensors per token. More layers means more memory per token. A 70B model with 80 layers uses ~2.5× more per-token memory than a 7B model with 32 layers.

**3. KV Cache Precision (bytes_per_element)**  
This represents the data type used to store cached keys and values. There are several.

- f16 = 2 bytes per element (default, best quality)
- q8_0 = 1 byte per element (50% VRAM savings, good quality)

**4. Head Geometry**  
This refers to the structural parameters that define how attention heads organize their key-value vectors.

- head_count_kv - Number of key-value attention heads (often less than query heads in grouped-query attention)
- key_length - Dimension of each key vector (typically the same as `head_count_kv / head_count_query`)
- value_length - Dimension of each value vector (usually equal to `key_length`)

```
Notes:

This is called "geometry" because it describes the **shape/structure** of the attention mechanism - how many heads there are and how the key/value vectors are partitioned across them. It's a fixed property of the model architecture that's baked into the neural network's design.

For example, in Llama 3 with Grouped-Query Attention (GQA):

- The model might have 32 query heads but only 8 KV heads
- Each KV head "shares" its key/value vectors across multiple query heads
- This geometry determines how the KV cache is organized in memory

Because these values are derived from the model's architecture, they're embedded in the GGUF file header and cannot be changed without retraining the model.
```

The KV_Per_Sequence is the per-token per layer value multiplied by the context window and number of layers:

```
KV_Per_Token_Per_Layer = head_count_kv × (key_length + value_length) × bytes_per_element
KV_Per_Sequence        = n_ctx × n_layers × KV_Per_Token_Per_Layer
```

The total Slot Memory is the number of slots multiplied by the KV_Per_Sequence. Then the total VRAM is the size of the model (model weights) plus the amount of Slot Memory.

```
Slot_Memory = NSeqMax × KV_Per_Sequence
Total_VRAM  = Model_Weights + Slot_Memory
```

## Real Model Calculation Example

Here is an example using the `Qwen3-Coder-30B-A3B-Instruct-UD-Q8_K_XL` model.

```
Model                   : Qwen3-Coder-30B-A3B-Instruct-UD-Q8_K_XL
Model Weights           : 36.0 GB
Context Window (n_ctx)  : 131,072 (128K)
Bytes Per Element       : 1 (q8_0)
block_count (n_layers)  : 48
attention.head_count_kv : 4
attention.key_length    : 128
attention.value_length  : 128
```

Step 1 — Per-token-per-layer cost:

```
KV_Per_Token_Per_Layer = 4 × (128 + 128) × 1 = 1,024 bytes
```

Step 2 — Per-sequence cost:

```
KV_Per_Sequence = 131,072 × 48 × 1,024 = ~6.4 GB
```

Step 3 — Total KV cache (NSeqMax = 2):

```
Slot_Memory = 2 × 6.4 GB = ~12.8 GB
```

Step 4 — Total VRAM:

```
Total_VRAM = 36.0 GB + 12.8 GB = ~48.8 GB
```

## VRAM Calculator In Action
