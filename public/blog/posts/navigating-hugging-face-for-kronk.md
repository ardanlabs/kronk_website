---
title: "Navigating Hugging Face for Kronk"
date: "2025-02-23"
slug: "navigating-hugging-face-for-kronk"
excerpt: "Learn how to find the right GGUF models on Hugging Face and decipher the acronyms—from Q8_K to UD-Q6_K_XL—so you can run the best models for your hardware."
author: "bill-kennedy"
banner: "/blog/images/Navigating-Hugging Face-for-Kronk.jpg"
---

At Ardan we have been hard at work over the past 3 months building [Kronk](https://github.com/ardanlabs/kronk). Kronk is two projects merged into one. First it's an extensive Go SDK that will allow you to use Go for hardware accelerated local inference with llama.cpp directly integrated into your Go applications via the [yzma](https://github.com/hybridgroup/yzma) module. Kronk also provides a model server (built with the SDK) to run local agentic workloads. The Kronk Model Server (KMS) is optimized to be your personal engine for running open source models locally.

One of the hardest things to figure out when starting to learn how to use open source models is selecting the right model. Hugging face as over 147k models to choose from in the GGUF (GPT-Generated Unified Format) format alone. The GGUF format is what llama.cpp currently supports. How do you identify which of these 147k models you can run and which ones are best for the work you want to accomplish? That is the question everyone struggles with.

In this post, I'm going to help you navigate Hugging Face (HF) to find the potential models you can use and decipher all the acronyms and labels you will see in the model names. I'll point you to some of the best providers of models in HF to give you the best chance to succeed.

## Hugging Face

This is what the homepage at HF looks like as of the writing of this post.

![hf home page](/blog/images/image1.png)

Right out of the box it feels overwhelming, so where do you start? My advice is always to start with the Unsloth set of models. This group is really dedicated to providing GGUF based models with the utmost quality. When they make mistakes, they fix them quickly. When I can use an Unsloth model, I will use it.

Here is the link to the Unsloth home page on HF. All of the different organizations on HF have their own page like this.

[Unsloth home page](https://huggingface.co/unsloth)

![Unsloth home page](/blog/images/image2.png)

Again this can feel overwhelming, but notice all the GGUF formatted models on the home page! If you click on the `Collections` link, you can see the 31 different collections of models they can provide.

[Unsloth collections](https://huggingface.co/unsloth/collections)

![Unsloth collections page](/blog/images/image3.png)

Now we are getting where we need to be. Look at the labels on the collections. We have Coder models, Vision (VL) models, gpt models, and if we were to scroll down you would even see more amazing models including embedding models.

Let's navigate into the `Qwen3-Coder` models since they are great for Agent use.

[Qwen3-Coder collection](https://huggingface.co/collections/unsloth/qwen3-coder)

![Qwen3-Coder page](/blog/images/image4.png)

So when you are on this page, it's good to start looking at the label underneath the Model family.

Model Family: unsloth/Qwen3-Coder-Next-GGUF  
Text Generation • 80B • Updated about 9 hours ago • 502k • 391

This is a `Text Generation` model which means we can use this for chat apps and agents. When an AI model is listed as "80B", it means the model has 80 billion parameters.

What are parameters? Parameters are the learnable weights and biases in a neural network that the model acquires during training. Think of them as the "knobs and dials" that the model adjusts to learn patterns from data. The more knobs and dials, the more accurate the model will behave. However the larger the model will be and the more memory we need to run the model.

I just saw an announcement for a 340B model, which is going to be amazing to run, but there is no way I could ever afford the hardware required to run it. Even at 80b this model is way too big for my M4 which has 128 GB of memory. A pure 80b model would probably need well over 160 GB on the low end to run.

That being said, I want to run a Qwen3-Coder-Next model because I know it will work great with my Cline coding agent. BTW, I am currently running a version of this model right now and it's helping me write this post.

How is this possible? Let's start with looking at the family model page.

[Qwen3-Coder-Next-GGUF](https://huggingface.co/unsloth/Qwen3-Coder-Next-GGUF)

![Qwen3-Coder options](/blog/images/image5.png)

You can see the full GGUF 16-bit version of the model is 159 GB in size. That's just the size of the money which needs to be placed in memory. There is also some overhead depending on the model settings you use (another post). However, look at the 6-bit version of this model. That will require ~70GB plus a little more to run and that for sure fits on my machine.

If you look at all these model options you see a whole bunch of codes, so what do they all mean?

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

The most important codes are the Q, K, and Size values. I tend to stay away from models with the other symbols because I am always looking to run the highest quality models I can run on my machine. Those would be the models at the bottom of the list.

Let's break down the Q, K, and Size value codes a bit more.

The GGUF format uses quantization to reduce the size and improve inference speed of large language models. Unsloth will take the original model, which is 480B parameters in a different format, and convert that to GGUF in all these different sizes. The Q value represents quantization bit widths or how many bits are used to store each model weight.

In the GGUF format, you will typically see a model listed as `QX_Y` where `X` represents the bit width (8, 7, 6, 5, 4, 3, 2) and `Y` represents the quantization variant or strategy.

Here are the common formats you will see:

| Format | Bit Width | Description |
| :---- | :---- | :---- |
| Q8_0 | 8-bit | Original 8-bit quantization |
| Q7_0 | 7-bit | 7-bit quantization |
| Q6_0 | 6-bit | 6-bit quantization |
| Q5_0 | 5-bit | 5-bit quantization |
| Q4_0 | 4-bit | 4-bit quantization |
| Q4_K | 4-bit | "K" variant (different strategy) |
| Q3_K | 3-bit | "K" variant |
| Q2_K | 2-bit | "K" variant |

If we go back to the model chart, the best quality model options we have are:

```
6-bit     Q6_K (65.6 GB)     UD-Q6_K_XL (68.6 GB)
8-bit     Q8_0 (84.8 GB)     UD-Q8_K_XL (93.4 GB)
16-bit    BF16 (159 GB)
```
The size of the model is a good quick indication of the quality you are going to get. Let's break down the model options to better understand what we are looking at.

**Highest Fidelity**: BF16 (159 GB)

* 16-bit brain float format - uses floating-point arithmetic
* Preserves maximum precision with 32,768 possible values per exponent
* No quantization loss - maintains original model weights exactly
* Best for applications requiring maximum accuracy and numerical stability
* Requires the most memory (159 GB)

**Least Information Loss**:

* BF16: Zero information loss - original precision
* Q8_0: 8-bit quantization with per-tensor scaling - minimal loss for most tasks
* Q8_K variants: Improved 8-bit quantization with better distribution
* Q6_K variants: 6-bit quantization - moderate information loss

**Best for Complex Tasks**:

* BF16: Optimal for complex reasoning, multi-step reasoning, and nuanced outputs
* Q8_K XL: Best quantized option with larger context window for complex tasks
* Q6_K XL: Can handle complex tasks but with noticeable quality trade-offs

If you want to go deeper between the `_0` vs `_K` here it is:

**Q8_0 (Original 8-bit Quantization)**

* Method: Simple per-tensor (whole tensor) quantization
* Approach: Uses a single scale factor for the entire tensor
* Drawback: Less efficient distribution of precision across weights
* File suffix: Q8_0 - the "0" indicates the original GGML quantization method

**Q8_K (K-quant / KoboldAI Quantization)**

* Method: Advanced block-based quantization
* Approach: Splits tensors into blocks (e.g., 32 or 64 elements) with separate scale factors per block
* Advantages:
  * Better precision distribution across weight ranges
  * More efficient use of bits
  * Generally better quality at same bit width
* File suffix: Q8_K, Q6_K - the "K" indicates KoboldAI's K-quant method

When using an Unsloth model, we can get this option as well:

UD- Prefix (Ultra-Dense / Unified Dense)

* More aggressive quantization that further compresses weights
* UD-Q8_K_XL uses K-quant but with additional compression
* XL suffix indicates extended context window (e.g., 32K vs 8K tokens)

Here is a quick summary table of these options:

| Model | Bit Width | Method | Size | Quality | Best For |
| :---- | :---- | :---- | :---- | :---- | :---- |
| BF16 | 16-bit | Floating-point | 159 GB | Highest | Maximum fidelity tasks |
| UD-Q8_K_XL | 8-bit | K-quant + Dense | 93.4 GB | High | Complex tasks + efficiency |
| Q8_0 | 8-bit | Original quant | 84.8 GB | High | General use |
| UD-Q6_K_XL | 6-bit | K-quant + Dense | 68.6 GB | Medium | Resource-constrained |
| Q6_K | 6-bit | K-quant | 65.6 GB | Medium | Balanced approach |

It's been my experience that if I use the K_XL version of the model at the highest Q value, I will get the best experience using my Cline agent. Today I am running the UD-Q6_K_XL model and it's been awesome. I wish I could run the UD-Q8_K_XL but it's impossible on my M4. The only bummer using the UD-Q6_K_XL model is that the model starts to behave when the context window fills to about 80K worth of tokens. This means for Agent work I have to make sure the tasks are fairly small and targeted.

## Conclusion

There is obviously much more to cover when it comes to configuration of these models. The model configuration directly affects how much memory we need to run the model. For now, looking at the size of the model is a good place to start and HF is good at listing the models in order of size and quality.

In the next post we will talk about model configuration and then introduce the VRAM Calculator that Kronk provides so you can get an accurate view of the amount of memory you need to run a given model at a given configuration.

If you can't wait, we wrote an extensive manual about Kronk and running models using the Kronk SDK and model server.

[Kronk Manual](https://github.com/ardanlabs/kronk/blob/main/MANUAL.md)
