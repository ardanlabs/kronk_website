---
title: "Navigating Hugging Face for Kronk"
date: "2025-02-27"
slug: "navigating-hugging-face-for-kronk"
excerpt: "Learn how to find the right GGUF models on Hugging Face and decipher the acronyms—from Q8_K to UD-Q6_K_XL—so you can run the best models for your hardware."
author: "bill-kennedy"
banner: "/blog/images/post1_banner.jpg"
---

At Ardan we have been hard at work over the past 3 months building [Kronk](https://github.com/ardanlabs/kronk). Kronk is two projects merged into one. First, it’s an extensive Go SDK that will allow you to use Go for hardware-accelerated local inference with llama.cpp directly integrated into your Go applications via the [yzma](https://github.com/hybridgroup/yzma) module. Kronk also provides a model server (built with the SDK) designed and optimized to be your personal engine for running open source models locally, especially agentic workloads.

One of the hardest things to figure out when you’re just starting is to know which open source models are the best to use for your use case. We need to use models that are in the GGUF (GPT-Generated Unified Format) format because this is the format that llama.cpp developed and uses. It was introduced in August 2023 by llama.cpp as a direct replacement and improvement over their previous GGML format.

_Note: GGUF (GPT-Generated Unified Format)": This expansion is disputed. GGUF was created by Georgi Gerganov (whose initials are "GG"), and "GGML" stands for "Georgi Gerganov Machine Learning." The "GG" in GGUF more likely refers to his initials, not "GPT-Generated." Some community sources do use "GPT-Generated" but it doesn't appear in the official llama.cpp spec._

There are currently over 147k GGUF models in Hugging Face (HF), so how can you identify which of these models are best for the work you want to accomplish? To make things more complicated, not all these models are the same and not all of them will run on your hardware. This is going to be one of the most frustrating aspects of the entire process. Eventually, you will figure out what you can and can’t run, and which model types work the best for you.

In this post, I’m going to help you navigate this world of models that you will see on HF. I will decipher the most important acronyms and labels you will see on the site and in the model names. I’ll point you to the best provider of GGUF models in HF (Unsloth) that will give you the best chance to succeed.

## Model Architectures

Kronk supports three distinct model architectures that define how parameters are organized and activated during inference. These architectures are Dense, Mixture of Experts (MoE), and Hybrid. These architectures apply across all model types including text generation, vision-language models (VLMs), and even specialized models like embeddings and re-rankers. Understanding these differences helps you choose the right model for your hardware and workload.

### Dense Models

Dense models are the standard transformer architecture that most people think of when they discuss large language models. In a dense model, every parameter participates in every token generation. When you process an input through a dense model, all of the model's weights are used to compute the output for each token.

This architecture offers predictable performance and consistent quality. Dense models read their weights sequentially from memory, which is highly efficient on Apple Silicon and systems with unified memory. The sequential access pattern maximizes memory bandwidth utilization, often resulting in higher tokens-per-second throughput compared to MoE models of similar size.

_Note: Unified Memory means that the CPU and GPU share a common pool of memory which greatly enhances efficiency._

Dense models are the most straightforward to configure and work well with all caching strategies in Kronk, including Incremental Message Caching (IMC). IMC is a caching strategy in Kronk where messages are maintained in the KV cache between requests so messages that have been seen before do not need to be re-tokenized and decoded. This provides a noticeable performance boost for long-context workloads.

Dense models are the most common architecture you'll find in GGUF format. Models like Llama 3, Qwen 2.5, Gemma, and Mistral all use dense architectures.

### Mixture of Experts (MoE) Models

Mixture of Experts models take a different approach. While they may have many total parameters, only a small subset is activated for each token. For example, the Qwen3-30B-A3B model has 30 billion total parameters but only activates about 3 billion per token. The "A3B" in the name stands for "3B active."

This design aims to combine the quality of large models with the speed of smaller ones. However, on memory-bandwidth-bound systems like Apple Silicon, MoE models can underperform dense models. The routing mechanism that selects which experts to activate creates scattered memory access patterns because expert weights are spread across memory rather than accessed sequentially. This scattered access underutilizes available bandwidth, sometimes making a smaller dense model faster despite the MoE's theoretical efficiency advantages.

MoE models also tend to be more sensitive to KV cache quantization due to their reliance on subtle attention patterns for expert routing decisions. Kronk recommends using `f16` cache types for MoE models to preserve routing accuracy, especially for long-context or reasoning workloads.

MoE architectures can also be vision-language models. For example, a VLM could use a dense projection layer to convert images to tokens, then route through MoE language layers for reasoning about the visual content.

Models like gpt-oss, Mixtral 8x7B, and DeepSeek-V3/V2 all use MoE architectures.

### Hybrid Models

Hybrid models represent a third architectural approach, combining traditional attention layers with recurrent layers (such as [DeltaNet](https://sustcsonglin.github.io/blog/2024/deltanet-1/) or [SSM/Mamba](https://huggingface.co/docs/transformers/en/model_doc/mamba)). Unlike MoE models, hybrid models are dense so every parameter participates in every token. The difference is that different layers use different mechanisms: some use [attention](<https://en.wikipedia.org/wiki/Attention_(machine_learning)>) while others use [recurrence](https://en.wikipedia.org/wiki/Recurrent_neural_network).

Kronk automatically detects hybrid models at load time and applies special handling:

- **KV cache must be f16** — quantized cache types are incompatible with recurrent layers, which doubles KV cache memory compared to models supporting `q8_0`

- **Flash attention is automatically disabled** — the recurrent layers don't work with flash attention optimization

- **Snapshot/restore caching** — Kronk uses a different state management approach for IMC, capturing and restoring the full sequence KV state including recurrent hidden state.

Hybrid models offer excellent quality per token with efficient sequential memory access patterns. The trade-off is total model size—since all parameters are used, you need sufficient unified memory to hold the complete model plus the larger f16 KV cache.

_Note: Hybrid architectures could theoretically be extended to VLMs, though this is less common since vision models typically rely on attention mechanisms for processing visual tokens._

Models like Qwen3.5 and LFM2 use Hybrid architectures.

### How These Architectures Apply Across Model Types

The model classification crosses all the model types that Kronk supports. Using the right model architecture for the hardware you have can make all the difference if that model is going to perform as well as it possibly can.

Here is a list of some of the models in the Kronk Catalog and how they are grouped:

```
Model Type: Text Generation
     Dense:      Qwen3-8B-Q8_0
     MoE:        cerebras_Qwen3-Coder-REAP-25B-A3B-Q8_0
     Hybrid:     LFM2-700M-GGUF
     Hybrid/MoE: Qwen3-Coder-Next-Q6_K

Model Type: Vision (VLM)
     Dense:      gemma-3-4b-it-q4_0
     MoE:        Qwen3-VL-30B-A3B-Instruct-Q8_0
     Hybrid:     LFM2.5-VL-1.6B-UD-Q8_K_XL
     Hybrid/MoE: Qwen3.5-35B-A3B-Q8_0

Model Type: Embedding
     Dense:  embeddinggemma-300m-qat-Q8_0

Model Type: Reranking
     Dense:  bge-reranker-v2-m3-Q8_0
```

What does all this matter?

Understanding these architectural differences will help you:

1. **Choose the right model for your hardware** — Dense models excel on Apple Silicon due to sequential memory access

2. **Configure optimal settings** — MoE needs `split_mode: row` when running on multi-GPU hardware. Hybrid models require a KV cache type of `f16`.

3. **Set realistic expectations** — MoE models may be slower on memory-bandwidth-limited systems despite fewer active parameters.

4. **Plan for scaling** — Different architectures scale differently across multiple GPUs

As the GGUF ecosystem evolves, new model architectures continue to emerge. Kronk's SDK-based design means new model types can be added through code updates without requiring changes to the underlying llama.cpp engine. The Kronk project maintains close alignment with llama.cpp developments to ensure support for emerging architectures as they become practical for local inference.

## Model Types

After understanding the different model architectures, the next thing is to understand the different model types that will exist for that architecture. Start by navigating to the Unsloth’s model collection page on Hugging Face (HF).

https://huggingface.co/unsloth/collections

![Unsloth collections page](/blog/images/post1_image1.png)

If this page makes you feel overwhelmed, welcome to the club. Unsloth has the best models in the HF ecosystem, IMHO. Try to use an Unsloth model first if what you need is available from them. You will have the best experience.

You can see there are Coder models, Vision (VL) models, gpt models, and if you were to scroll down you would see even more amazing models including embedding models.

Let’s navigate into the `Qwen3.5` models since they are great for Agent use.

https://huggingface.co/collections/unsloth/qwen3-coder

![Qwen3.5 page](/blog/images/post1_image2.png)

So when you are on this page, it’s good to start looking at the label in tiny text underneath the Model family.

![Qwen3.5 page](/blog/images/post1_image4.png)

This is an `Image-Text-to-Text` model which means we can use this for chat apps, agents, and we can submit and ask questions about images. When an AI model is listed as "35B", it means the model has 35 billion parameters.

What are these parameters? The parameters are the learnable weights and biases in a neural network that the model acquires during training. Think of them as the "knobs and dials" that the model adjusts to learn patterns from data. The more knobs and dials, the more accurately the model will behave (in theory). However the larger the model is, the more memory we need to run the model.

I just saw an announcement recently for a 340B model, which is going to be amazing to run, but there is no way I could ever afford the hardware required to run it. Even a model that has 80B parameters is way too big for my M4 which has 128 GB of memory. A Dense 80B model would probably need well over 160 GB on the low end to run.

That being said, I want to run the Qwen3.5-35B-A3B model because I know it will work great with the Cline coding agent. BTW, I am currently running a version of this model and it’s helping me write this post.

Let’s look at all the options we have from Unsloth for this model.

https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF

![Qwen3.5- options](/blog/images/post1_image3.png)

You can see the largest option is the BF16 version at 69.4 GB. The size of the model can give you a very quick understanding of how much memory you need at the very least to run the model. There is also memory that is needed beyond the size of the model, but that depends on the model settings you use. We will need to talk about that in another post.

I have 128 GB of memory on my machine so that particular version of the model isn’t out of reach. That being said, the BF16 format is primarily used in machine learning so we can’t use that model. However, look at the 8-bit versions of this model. The UD-Q8_K_XL is 42 GB which will fit very nicely on my machine and this is a model I can absolutely run.

If you look at all the different options for all the different bit sizes, you will see a series of letters and numbers. These tell us about the different model options we can download and use. Let me try to break down these letters and numbers for you.

```
| Code  | Meaning                                                            |
|-------|--------------------------------------------------------------------|
| UD-   | Unsloth Dynamic — mixed-precision important layers get higher bits |
| IQ    | Importance-weighted Quantization (imatrix-based)                   |
| TQ    | Ternary Quantization                                               |
| MXFP4 | Microscaling 4-bit floating point                                  |
| Q     | Quantization Bit Width                                             |
| K     | K-quant (improved quality over plain Q)                            |
| Size  | _XXS / _S / _M / _L / _XL                                          |
| _NL   | Non-Linear quantization                                            |
| BF16  | Brain Float 16-bit (no quantization)                               |
```

The most important codes are the Q, K, and Size values. I tend to stay away from models with the other symbols because I am always looking to run the highest quality models that will run on my machine. Those would be the models at the bottom of the list.

Let’s break down the Q, K, and Size value codes a bit more.

The GGUF format uses quantization (Q) to reduce the size and improve inference speed of large language models. Unsloth will take the original model and convert it into a GGUF format for all these different model sizes and options. The Q value represents how many bits are used to store each model weight.

In the GGUF format, you will typically see a model listed as `QX_Y` where `X` represents the bit width (8, 7, 6, 5, 4, 3, 2) and `Y` represents the quantization variant or strategy.

Here are the common formats you will see:

| Format | Bit Width | Description                      |
| ------ | --------- | -------------------------------- |
| Q8_0   | 8-bit     | Original 8-bit quantization      |
| Q7_0   | 7-bit     | 7-bit quantization               |
| Q6_0   | 6-bit     | 6-bit quantization               |
| Q5_0   | 5-bit     | 5-bit quantization               |
| Q4_0   | 4-bit     | 4-bit quantization               |
| Q4_K   | 4-bit     | "K" variant (different strategy) |
| Q3_K   | 3-bit     | "K" variant                      |
| Q2_K   | 2-bit     | "K" variant                      |

If we go back to the model chart, the best quality model options we have are:

```
6-bit     Q6_K (28.6 GB)     UD-Q6_K_XL (30.3 GB)
8-bit     Q8_0 (36.9 GB)     UD-Q8_K_XL (42 GB)
```

The size of the model is a good quick indication of the quality you are going to get. Let’s break down the model options to better understand what we are looking at.

**Least Information Loss**:

- Q8_0: 8-bit quantization with per-tensor scaling - minimal loss for most tasks
- Q8_K variants: Improved 8-bit quantization with better distribution
- Q6_K variants: 6-bit quantization - moderate information loss

**Best for Complex Tasks**:

- Q8_K XL: Best quantized option with larger context window for complex tasks
- Q6_K XL: Can handle complex tasks but with noticeable quality trade-offs

If you want to go deeper into these quantization strategies, here it is:

**Q8_0 (Original 8-bit Quantization)**

- Method: Simple per-block quantization
- Approach: Splits tensors into blocks of 256 weights, each with its own scale factor
- Drawback: Less efficient distribution of precision across weights compared to K-quants
- File suffix: Q8_0 - the "0" indicates the original legacy quantization method

**Q8_K (K-quant Quantization)**

- Method: Advanced multi-level block-based quantization
- Approach: Uses a two-level scheme with small blocks grouped into super-blocks, each with their own scale factors for better precision
- Advantages:
  - Better precision distribution across weight ranges
  - More efficient use of bits
  - Generally better quality at same bit width
  - File suffix: Q8_K, Q6_K - the "K" indicates the K-quant method developed by the llama.cpp project

When using an Unsloth model, we can get this option as well:

**UD- Prefix (Unsloth Dynamic)**

- More aggressive quantization that further compresses weights
- UD-Q8_K_XL uses K-quant but with additional compression
- XL suffix indicates extended context window (e.g., 32K vs 8K tokens)

Here is a quick summary table of these options:

| Model      | Bit Width | Method          | Size    | Quality | Best For                   |
| ---------- | --------- | --------------- | ------- | ------- | -------------------------- |
| UD-Q8_K_XL | 8-bit     | K-quant + Dense | 42 GB   | High    | Complex tasks + efficiency |
| Q8_0       | 8-bit     | Original quant  | 36.9 GB | High    | General use                |
| UD-Q6_K_XL | 6-bit     | K-quant + Dense | 30.3 GB | Medium  | Resource-constrained       |
| Q6_K       | 6-bit     | K-quant         | 28.6 GB | Medium  | Balanced approach          |

It’s been my experience that if I use the K_XL version of a model at the highest Q value, I will get the best experience using my Cline agent. Today I am running the Qwen3.5-35B-A3B-UD-Q8_K_XL model and it’s been awesome.

## Conclusion

There is obviously much more to cover when it comes to the configuration of these models. The model configuration directly affects how much actual memory we need to run the model. For now, looking at the size of the model is a good place to start and HF is good at listing the models in order of size and quality.

In the next post, I will talk about model configuration and then introduce the VRAM Calculator that Kronk provides so you can get an accurate view of the amount of memory you need to run a given model at a given configuration.

If you can’t wait, we wrote an extensive manual about Kronk and running models using the Kronk SDK and model server.

https://github.com/ardanlabs/kronk/blob/main/MANUAL.md
