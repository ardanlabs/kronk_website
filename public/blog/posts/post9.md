---
title: "Understanding Go AI Inference: A New Series Featuring Yzma and Kronk"
date: "2026-07-25"
slug: "understanding-go-ai-inference-series"
excerpt: "Jesús Espino's Understanding Go AI Inference series takes Go developers inside the local inference stack, from llama.cpp and Yzma to Kronk. Follow every installment from this living reading list."
author: "jesus-espino"
---

## A Series Worth Following

I am writing a new series called [Understanding Go AI Inference](https://internals-for-interns.com/series/understanding-go-ai-inference/), and I want to make sure the Go community knows about it.

For most developers, working with a large language model begins and ends with an HTTP request. You send a prompt to a service, tokens stream back, and everything below the API remains hidden. In this series, I am opening up that black box and explaining the local inference stack from the inside out.

That stack begins with [llama.cpp](https://github.com/ggml-org/llama.cpp), the C and C++ inference engine that makes it practical to run models on everyday hardware. [Yzma](https://github.com/hybridgroup/yzma) brings those capabilities directly into Go without cgo, and [Kronk](https://github.com/ardanlabs/kronk) builds a high-level Go SDK and model server on top of Yzma. The series will work its way through each layer and show how they fit together.

This post is a living reading list. I will update it as I publish each new installment. [Internals for Interns](https://internals-for-interns.com/) remains the canonical home for the articles, so follow the links below to read them in full.

## The Series

### 1. What Is Inference?

The opening article strips away the mystery surrounding inference. A trained language model is a collection of frozen weights, and inference is the process of using those weights to predict the next token. Producing a response means repeating that prediction in an autoregressive loop, one token at a time.

I follow that process all the way down the stack, explaining how text becomes tokens, how a model produces logits, how sampling selects the next token, and why the KV cache keeps generation efficient as a conversation grows. I also open up the GGUF format to show how model metadata, the tokenizer, and quantized weights are stored and loaded across CPU memory and VRAM.

If you use local models but have ever wondered what actually happens between loading a GGUF file and seeing the first token, this is the place to start.

**[Read “Understanding Go AI Inference: What Is Inference?” on Internals for Interns →](https://internals-for-interns.com/posts/go-ai-inference-what-is-inference/)**

### 2. Yzma

The second article moves up the stack to Yzma, the Go bindings that call llama.cpp directly without cgo or a C toolchain. I explain how Yzma combines purego with libffi to load prebuilt llama.cpp libraries at runtime, find their functions, and call them using the correct platform ABI—even when the API passes C structs by value.

I also trace how Yzma selects and downloads the right llama.cpp build for the operating system, CPU architecture, and available accelerator, then fetches GGUF models ready for local inference. Along the way, the article shows both the flexibility of runtime bindings and the care required to keep Go and C data layouts compatible.

If you want to understand how an ordinary Go binary built with `CGO_ENABLED=0` can still drive llama.cpp with Metal, CUDA, Vulkan, or ROCm acceleration, this installment opens up the machinery that makes it possible.

**[Read “Understanding Go AI Inference: Yzma” on Internals for Interns →](https://internals-for-interns.com/posts/yzma/)**

### 3. The Kronk SDK

The third article climbs one level above Yzma into Kronk's SDK, the Go layer that turns llama.cpp's low-level API into a small surface designed for application development. I walk through how `Init` loads the native backend, how `New` loads a model and builds the machinery around it, and how a chat request is copied, validated, templated, tokenized, and queued for execution.

The article then explores the systems behind that simple API: incremental message caching that reuses a conversation's KV cache, continuous batching that lets multiple requests share one model, and execution slots that keep each conversation's state separate. It also covers protections for practical edge cases such as duplicate beginning-of-sequence tokens, UTF-8 characters split across tokens, and stop sequences split across streamed output.

If you want to understand what Kronk handles between a GGUF model on disk and a well-formed response in your Go application, this installment traces the complete text-generation path.

**[Read “Understanding Go AI Inference: The Kronk SDK” on Internals for Interns →](https://internals-for-interns.com/posts/kronk-sdk/)**

### 4. Model Management

The fourth article follows a model through Kronk's management layer, from a provider and model ID to files on disk and a configuration that fits the available hardware. I explain how the catalog discovers files on Hugging Face, how Kronk reads GGUF metadata without downloading an entire model, and how AutoTune balances context length and KV cache precision against the machine's available memory.

The article then traces model loading and resource management: concurrent requests share a single load, memory is reserved before use, and idle models are evicted only when necessary. It also shows how Kronk handles discrete GPUs and unified memory differently while ensuring that a model serving active requests is never unloaded.

If you want to understand how Kronk gets models onto disk, sizes them for your machine, and safely shares finite RAM and VRAM among them, this installment covers the complete lifecycle.

**[Read “Understanding Go AI Inference: Model Management” on Internals for Interns →](https://internals-for-interns.com/posts/kronk-model-management/)**

### 5. The Model Server

The final article follows a streaming `POST /v1/chat/completions` request through Kronk's OpenAI-compatible model server. I show how the server validates and prepares a request before committing the HTTP response, then streams generated tokens as Server-Sent Events with keep-alive comments that prevent proxies from closing quiet connections.

The article also explains what changes after the server sends `200 OK`: errors can no longer change the status code, so model failures travel inside the stream while connection failures are preserved for logging and metrics without writing a second response. It closes by tracing the middleware stack and highlighting protocol-specific details in the OpenAI- and Anthropic-compatible endpoints.

If you want to understand how Kronk turns local inference into a resilient streaming HTTP API, this installment follows the request from the first middleware to the final token.

**[Read “Understanding Go AI Inference: The Model Server” on Internals for Interns →](https://internals-for-interns.com/posts/kronk-model-server/)**

## The Complete Stack

These five articles establish the inference engine, show how Yzma makes it available directly from Go, and trace how Kronk turns that foundation into an SDK, a model-management system, and a streaming HTTP server.

I am excited to tell this story because understanding the layers below an API makes us better at choosing models, sizing hardware, diagnosing performance, and designing systems around local inference. These are not just implementation details. They explain why the tools behave the way they do.

Visit the [Understanding Go AI Inference series page](https://internals-for-interns.com/series/understanding-go-ai-inference/) on Internals for Interns to read the complete series.
