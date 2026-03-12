---
title: "Understanding the Kronk VRAM Calculator"
date: "2026-03-12"
slug: "understanding-the-kronk-vram-calculator"
excerpt: "Learn how to use the VRAM calculator to know exactly how much memory you need to run a model in Kronk."
author: "bill-kennedy"
banner: "/blog/images/post2_banner.jpg"
ogImage: "/blog/images/post2_twitter.jpg"
---

## Introduction

One of the biggest problems you will run into when trying to run an LLM on your local machine is not having enough memory. Finding out the model won’t run after waiting 20 minutes to download the model and spending another 20 minutes fighting through settings that will never work is highly frustrating.

That's why we built the Kronk VRAM (Video RAM) calculator. It analyzes GGUF model files by reading their metadata. You answer a few questions about your system's memory and preferences, and then the calculator runs a formula that will show whether a model will fit — and allows you to tune settings if it doesn't.

In this post, we will walk you through the VRAM calculator so you can understand all the values and questions you will be presented with. After this post, you won’t waste your time trying to download a model that will never run on your hardware to begin with. At a bare minimum, you will find settings that will let it run, even if it’s not going to be the most efficient.

## The VRAM Formula

Before I can show you the calculator, I need to present the formula and break it down into its different components. Without this knowledge the calculator may not make any sense to you.

This is the formula if you want to know the total VRAM required to run a model on the GPU:

```
Total VRAM = Model_Weights + KV_Cache + Compute_Buffer
```

The formula is made up of these 3 components:

| Component      | What It Is                       | Typical Size  | User Control                       |
| -------------- | -------------------------------- | ------------- | ---------------------------------- |
| Model_Weights  | The model's trained parameters   | 2GB - 100+ GB | Quantization choice (Q4, Q8, etc.) |
| KV_Cache       | Context for conversation history | 1GB - 50+ GB  | Context window size, batch slots   |
| Compute_Buffer | GPU working memory for inference | 256MB - 1GB+  | Auto-calculated (heuristic)        |

Each of these components come with some intricacies, so I will break them down and give you more details for each.

## Component 1: Model Weights

Model weights are the actual learned parameters of the model’s neural network. They're stored in the model file and represent everything the model "knows" after training. I like thinking of these learned parameters as knobs that are hardcoded to a specific setting.

![knobs](/blog/images/post2_image1.png)

The image above is what I see in my head when I think about a model file. In a 30 billion parameter model there are 30 billion of these knobs set in some fixed position just like the image above. There are also layers of knobs like you see in the picture. Those 30 billion knobs will be distributed across a number of layers.

### How We Calculate the Value for Model_Weights

If your goal is to put 100% of the model's knobs in VRAM, then the size of the GGUF model file you download is the amount of VRAM you’ll need for the `Model_Weights` parameter.

```
 Model_Weights = modelFileSizeInBytes
```

The GGUF file already has the [quantization](https://en.wikipedia.org/wiki/Large_language_model#Quantization) baked in. A Q4 file is smaller than a Q8 file, while an FP16 file is even larger. Whatever file you download, its size on disk is the amount of VRAM you need for the `Model_Weights` parameter when wanting to load 100% of the knobs in VRAM.

Here's how different quantization levels could affect the file size and VRAM needed for a `30B` model:

| Quantization | Bytes Per Parameter | GGUF File Size ≈ Model Weights |
| ------------ | ------------------- | ------------------------------ |
| Q4_K_M       | ~0.5                | ~15 GB                         |
| Q6_K         | ~0.75               | ~22.5 GB                       |
| Q8_0         | ~1.0                | ~30 GB                         |
| FP16         | 2.0                 | ~60 GB                         |

Loading the entire set of knobs in VRAM is the best way to go, but not always possible. Sometimes the model is too large to fit entirely in VRAM. When this is the situation, there are two ways to load a portion of the model in VRAM and have the rest of the model loaded in system memory for the CPU to process. These two options are: layer offloading and expert offloading. They work very differently, and it’s important to understand the distinction.

### Layer Offloading (All Models)

Layer offloading allows you to load entire layers of the model in system memory for the CPU to process. When you take this option, every token processed pays a penalty because every token must pass through every layer of the model, one after the other. When a layer will be processed by the CPU, processing stalls while that layer does its work in slower system memory and compute.

Here is a representation of loading the first 20 layers of a model in VRAM and the remaining 12 layers in system memory.

```
       GPU VRAM                 CPU SYSTEM MEMORY
┌───────────────────────┐    ┌───────────────────────┐
│  Layer 0  (fast)      │    │  Layer 20 (slow)      │
│  Layer 1  (fast)      │    │  Layer 21 (slow)      │
│  ...                  │    │  ...                  │
│  Layer 19 (fast)      │    │  Layer 31 (slow)      │
└───────────────────────┘    └───────────────────────┘
        Token must pass through ALL layers →→→
```

For Dense models, every knob in every layer participates in every token, so the performance hit is severe. Hybrid models have the same problem — their recurrent layers maintain hidden state that must be updated for every token, so every knob is active just like a Dense model. You’re bottlenecked by the slowest layer. For MoE models, the hit is less painful because only the always-active knobs and a few selected expert knobs in each layer need to do the work — the remaining expert knobs sit idle.

In this scenario, the VRAM calculator splits the `Model_Weights` parameter into two variables:

```
Model_Weights_GPU = Sum of all weights in GPU layers
Model_Weights_CPU = Sum of all weights in CPU layers
```

### Expert Offloading (MoE Models Only)

MoE models provide a second and smarter offloading strategy called expert offloading. To understand it, you need to know how MoE layers are structured.

In an MoE model, each layer contains two distinct types of knobs:

**Always Active Weights**:
These are knobs that participate in every single token generated, regardless of the input. This includes things like the attention knobs, normalization knobs, embeddings, and the output head.

_Note: Embeddings (also called the input embedding layer) is the very first thing that happens when a token enters the model. Each token starts as an integer ID (e.g., the word "hello" might be token 15339). The embedding layer is a giant lookup table that converts that integer into a dense vector of numbers — for example, a vector of 4096 floating-point values. That vector is what actually flows through the rest of the model's layers. The table has one row per vocabulary entry, so a model with a 150k token vocabulary and 4096-dimensional embeddings has a 150k × 4096 matrix._

_Output head (often called lm_head) is the mirror image at the very end. After the token has passed through all the transformer layers, the model has a final hidden-state vector. The output head projects that vector back to vocabulary size — producing a probability score (logit) for every possible next token. The model then samples from those probabilities to pick the next token._

_Both are always-active because every token must enter through the embedding layer and exit through the output head, no matter what happens in between._

**Expert Weights**:
These are knobs that are dynamically selected at runtime to participate in token generation. Each layer contains multiple expert knobs, but only a few are activated for any given token. For example, a model might have 8 expert knobs per layer but only use 2 of those knobs per token.

Here is a representation of a layer of 8 knobs where 2 expert knobs are activated.

```
         MoE Layer (inside one layer)
┌──────────────────────────────────────────────┐
│   Always Active: attention, norms (small)    │
├──────────────────────────────────────────────┤
│ Expert 1  │ Expert 2  │ Expert 3  │ Expert 4 │
│ (unused)  │ (ACTIVE)  │ (unused)  │ (unused) │
│           │           │           │          │
│ Expert 5  │ Expert 6  │ Expert 7  │ Expert 8 │
│ (unused)  │ (unused)  │ (ACTIVE)  │ (unused) │
└──────────────────────────────────────────────┘
   Only 2 of 8 experts activate per token
```

The expert knobs make up the bulk of the model’s size. The always-active knobs are relatively small by comparison. Expert offloading takes advantage of this: the always-active knobs stay on the GPU, while the expert knobs from selected layers move to the CPU.

```
       GPU VRAM                CPU System Memory
┌───────────────────────┐    ┌───────────────────────┐
│ Always Active knobs   │    │ Expert knobs from     │
│ (all layers, on GPU)  │    │ bottom layers         │
│                       │    │                       │
├───────────────────────┤    │                       │
│ Expert knobs from     │    │ (only hit when an     │
│ top N layers          │    │  expert routes there) │
└───────────────────────┘    └───────────────────────┘
```

This is less painful than layer offloading because the always-active computation still runs at full GPU speed for every token. Only the expert lookups for offloaded layers hit the CPU, and since only a fraction of experts activate per token, most of that CPU memory sits idle on any given token.

In this scenario, the VRAM calculator calculates the `Model_Weights` parameter like this:

```
Model_Weights_GPU = alwaysActiveWeights + expertWeightsOnGPU
Model_Weights_CPU = expertWeightsOnCPU
```

### Where To Find The `Model_Weights` Parameter

How you determine the `Model_Weights` parameter depends on which scenario you’re in.

**All Layers on GPU**: The model file size in bytes is the value for the `Model_Weights` parameter. You can find this by checking the file size on disk after downloading, or by looking at the file size on the Hugging Face model page before you download.

**Example:** A `Qwen3-8B-Q4_K_M.gguf` file is ~5.5GB on disk, so Model_Weights = ~5.5GB.

**Layer Offloading**: You need to know how many total layers the model has and how many you’re keeping on the GPU. The model’s layer count is stored in the GGUF metadata under `llama.block_count`. Since layers are roughly equal in size, you can estimate:

```
Model_Weights_GPU = (gpuLayers / totalLayers) × modelFileSize
Model_Weights_CPU = (cpuLayers / totalLayers) × modelFileSize
```

**Example:** A 5.5GB model with 32 layers and 20 layers on the GPU: Model_Weights_GPU ≈ (20/32) × 5.5GB ≈ 3.4GB.

**Expert Offloading**: You need to know the size of the always-active knobs and the expert knobs separately. These aren’t values you can easily calculate by hand — the VRAM calculator reads the individual tensors from the GGUF file and categorizes them automatically. The calculator will show you the split and let you choose how many layers of expert knobs to keep on the GPU.

## Component 2: KV Cache (The Hidden Beast)

During token generation the model needs to remember previous tokens so it doesn't have to reprocess the entire conversation for every new token it generates. The KV cache acts as the model's short-term memory. Each token that passes through the model produces two vectors per layer that get stored in the KV cache:

- **K (Key)**: Used to match against other tokens during attention
- **V (Value)**: The information that gets pulled from a token when it's matched

The size of the KV Cache is set by you when you specify the context window which represents the maximum number of tokens you want to store. This can be as small as 1k tokens and as large as 256k tokens or more. The model has a maximum number of tokens the context window is allowed to be, so the value can't be larger than that number. The GGUF metadata will share that information usually in a `general.architecture.context_length` field.

The KV cache is pre-allocated at a fixed size when the model loads based on the maximum number of tokens you want to store. At the beginning of a model interaction, the KV cache is empty and then as the conversation continues, input messages are tokenized/decoded and processed through the model, with the resulting KV vectors stored in the cache. Output tokens follow the same path. Depending on how the server is configured, those cached vectors might persist across requests or the KV cache will be cleared.

The KV_Cache component of the formula is broken into these three parts:

```
KVPerTokenPerLayer = head_count_kv × (key_length + value_length) × bytes_per_element
KVPerSlot          = context_window × block_count × KVPerTokenPerLayer
KV_Cache           = slots × KVPerSlot
```

### Key Variables Explained

Let's break down each variable you will find in the GGUF metadata:

| Variable              | Meaning                      | Typical Value           | Where To Find In GGUF           |
| --------------------- | ---------------------------- | ----------------------- | ------------------------------- |
| **head_count_kv**     | Number of KV attention heads | 8, 16, 32+              | `llama.attention.head_count_kv` |
| **key_length**        | K dimension per head         | 128                     | `llama.attention.key_length`    |
| **value_length**      | V dimension per head         | 128                     | `llama.attention.value_length`  |
| **bytes_per_element** | Cache quantization size      | 1 (Q8_0), 2 (F16)       | User choice (cache type)        |
| **context_window**    | Max tokens to remember       | 8K, 32K, 128K+          | Model capability / user config  |
| **block_count**       | Number of transformer layers | 32 (small), 80+ (large) | `llama.block_count`             |
| **slots**             | Concurrent conversations     | 1-5                     | User choice                     |

Let's calculate the size of the KV cache for a typical model with these common settings:

```
head_count_kv     = 8      (from metadata)
key_length        = 128    (from metadata)
value_length      = 128    (from metadata)
bytes_per_element = 1      (Q8_0 cache quantization)
context_window    = 32768  (32K tokens)
block_count       = 32     (32 layers)
slots             = 4      (4 concurrent users)
```

**Step-by-step:**

```
KVPerTokenPerLayer = 8 × (128 + 128) × 1 = 2,048 bytes
KVPerSlot          = 32,768 × 32 × 2,048 = 2,147,483,648 bytes (2 GB per slot)
KV_Cache           = 4 × 2,097,152 KB    = 8,589,934,592 bytes (8 GB total)
```

For this model configuration the KV cache requirements would be 8GB of VRAM.

### What You Control

One of the variables you have control over is the `bytes_per_element` value. This represents the size of each element that is stored in the KV Cache. You control this by choosing the KV cache type.

| Cache Type | Bytes Per Element | VRAM Impact       | Quality Impact |
| ---------- | ----------------- | ----------------- | -------------- |
| **Q8_0**   | 1 byte            | 50% less than F16 | Minimal        |
| **F16**    | 2 bytes           | Baseline          | None           |

For example, if you want to maintain up to 32k tokens in the KV Cache, you would need ~8GB of memory if you set the cache type to Q8_0 or ~16GB of memory if you set the cache type to F16.

The other variable you have control over is the number of slots. This represents the number of parallel requests you want to batch in the GPU for processing. If you're the only one using the model, then you can use a slot value of 1.

```
slots = 1  // instead of 4
```

This change would reduce the size of the KV cache from ~8GB to ~2GB in the example.

Here is a chart that compares using 1 slot versus using 4.

| Context Window | Slots | Cache Type | KV Cache |
| -------------- | ----- | ---------- | -------- |
| 8K             | 1     | Q8_0       | ~500 MB  |
| 8K             | 1     | F16        | ~1 GB    |
| 8K             | 4     | Q8_0       | ~2 GB    |
| 8K             | 4     | F16        | ~4 GB    |
|                |       |            |          |
| 32K            | 1     | Q8_0       | ~2 GB    |
| 32K            | 1     | F16        | ~4 GB    |
| 32K            | 4     | Q8_0       | ~8 GB    |
| 32K            | 4     | F16        | ~16 GB   |
|                |       |            |          |
| 64K            | 1     | Q8_0       | ~4 GB    |
| 64K            | 1     | F16        | ~8 GB    |
| 64K            | 4     | Q8_0       | ~16 GB   |
| 64K            | 4     | F16        | ~32 GB   |
|                |       |            |          |
| 128K           | 1     | Q8_0       | ~8 GB    |
| 128K           | 1     | F16        | ~16 GB   |
| 128K           | 4     | Q8_0       | ~32 GB   |
| 128K           | 4     | F16        | ~64 GB   |

## Component 3: Compute Buffer

The compute buffer is the working VRAM the GPU needs during inference. There are three components to this.

- Temporary tensor calculations
- Attention mechanism intermediate results
- Activation storage

### How We Estimate The Computer Buffer

The calculator uses a heuristic based on model size:

```go
if modelSize < 50GB:
  baseBuffer = 256 MB
else:
  baseBuffer = 512 MB

// Add embedding component for certain models
embeddingComponent = 8 × 512 × embedding_length × 4

// Plus 10% safety margin
total = (baseBuffer + embeddingComponent) × 1.1
```

Typically, you need 256MB - 512MB of compute buffer for most models.

## Complete Formula Example

Let's walk through a complete example of the formula using the `Qwen3.5-35B-A3B-UD-Q8_K_XL.gguf` model on a 64GB Mac.

- GPU: 64GB unified memory
- Running single user (slots = 1)
- Want 32K context window

**Step 1: Get model size from file**

```
Model Weights: 45.3 GB (Q8 quantization, ~35B total params, ~3B active)
```

**Step 2: Extract Metadata**

You can read GGUF metadata without downloading by using a Range request:

```bash
curl -sL -r 0-131071 "https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF/resolve/main/Qwen3.5-35B-A3B-UD-Q8_K_XL.gguf" -o header.bin 2>&1
```

Look for GGUF metadata keys in the file:

```
qwen35moe.block_count = 40
qwen35moe.attention.head_count_kv = 2
qwen35moe.attention.key_length = 256
qwen35moe.attention.value_length = 256
```

**Step 3: Choose cache configuration**

- bytes_per_element = 1 (Q8_0)
- slots = 1 (single user)

**Step 4: Calculate**

```
KVPerTokenPerLayer = 2 × (256 + 256) × 1 = 1,024 bytes
KVPerSlot          = 32,768 × 40 × 1,024 = 1.2 GB
SlotMemory         = 1 × 1.2 GB = 1.2 GB
Compute Buffer     ≈ 500 MB (heuristic)
```

**Step 5: Total**

```
Model Weights:    45.3 GB
KV Cache:          1.2 GB
Compute Buffer:    0.5 GB
─────────────────────────
Total VRAM:       47.0 GB
```

On your 64GB Mac you can run this MoE model comfortably with room for the OS using `Q8_0` for the KV cache type and using 1 slot.

## Tour of the VRAM Calculator

Now that we understand the formula and the different components of the formula, I can show you how to use the VRAM calculator to validate the settings you need to run a particular model on your machine.

You need to start the Kronk Model Server (KMS) and then navigate your browser to `localhost:8080`. Read the manual about installing the Kronk [CLI tooling](https://www.kronkai.com/manual#22-installing-the-cli) and to learn how to run the model server.

Let's use the same model we just used, the `Qwen3.5-35B-A3B-UD-Q8_K_XL` model.

![screen 1](/blog/images/post2_image2.png)

To start using the calculator, you will provide the download link for the model you want to check. Then you can use the defaults or adjust the parameters we talked about that you control. Then finally hit the `Calculate VRAM` button to get your answer.

You can see on the screen for the same model we used in the previous section, when we put all the layers of the model in VRAM we get 46.89GB of VRAM required.

All models give you the ability to offload layers to the CPU. The slider gives you an opportunity to see how many layers you might need to offload to allow some layers to run on the GPU. If you are using a MoE model, then the expert offloading option is available.

Below the total VRAM calculation is metadata to help you see more of the details.

![screen 2](/blog/images/post2_image3.png)

## Conclusion

Running LLMs locally is incredibly rewarding, but it comes with a real constraint: memory. Unlike cloud-hosted models where someone else worries about hardware, local inference means you need to understand exactly what your machine can handle before you commit to downloading and configuring a model. That's the problem the VRAM calculator was built to solve.

In this post, we broke down the three components of the VRAM formula — Model Weights, KV Cache, and Compute Buffer — and showed how each one contributes to the total memory footprint. We walked through how quantization affects model weight size, how context window length and slot count can cause the KV cache to balloon, and how the compute buffer is estimated using a simple heuristic. We also covered the two offloading strategies — layer offloading and expert offloading — and why MoE models give you more flexibility when your GPU can't fit the entire model.

The key takeaway is that VRAM usage isn't a single number you look up — it's a calculation that depends on choices you make: which quantization you download, how large you set the context window, what cache type you use, and how many concurrent users you want to support. Small adjustments to these settings can make the difference between a model that runs smoothly and one that won't load at all.

The Kronk VRAM calculator automates this entire process. Instead of doing the math by hand or guessing, you paste a Hugging Face download link, set your preferences, and get an immediate answer. It reads the GGUF metadata for you, categorizes the tensors, and shows you exactly how the memory breaks down. If the model doesn't fit, the offloading sliders let you explore trade-offs in real time.

Before you spend time downloading your next model, run it through the calculator first. It takes seconds and will save you from the frustration of discovering — after a long download and a lot of configuration — that the model was never going to fit on your hardware to begin with.
