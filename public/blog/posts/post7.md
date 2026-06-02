---
title: "Free Yourself From The Copilot Tax"
date: "2026-06-02"
slug: "free-yourself-from-the-copilot-tax"
excerpt: "GitHub Copilot's switch to token-based billing is turning $29 subscriptions into $750 bills overnight, and developers are right to be furious. This post shows you how to walk away from the meter entirely — install Kronk, point VS Code Chat at it, run a 30B coding model on your own hardware, and get back to writing code without watching a usage counter tick."
author: "bill-kennedy"
banner: "/blog/images/post7_banner.jpg"
ogImage: "/blog/images/post7_twitter.jpg"
---

## Introduction

On June 1st, Microsoft flipped GitHub Copilot from a flat-rate subscription to a token-usage billing model — and the developer community has not taken it well.

[https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/](https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/)

The reactions on Reddit and X have been brutal. One developer reported their bill jumping from around $29 per month to nearly $750. Another shared a screenshot showing a jump from $50 to roughly $3,000. The pattern is hard to miss: Microsoft spent two years training developers to lean on the chat panel for everything — multi-step refactors, agent loops, sub-agent fan-outs — and then changed the meter so that exact behavior is the most expensive thing you can do.

If you're an enterprise with a procurement department, you'll absorb the change. If you're an individual developer, a small team, or a contractor paying out of your own pocket, you're now staring at a usage curve that can swing by 10x or 100x from one busy day to the next. That is not a tool — that is a liability.

The good news is that you no longer need a hyperscaler subscription to get a capable coding assistant. The open-source models released in the last twelve months are genuinely good at writing and editing code, and the tooling to run them locally has caught up. With **Kronk** as your local model server, you can run a 30B-parameter MoE coding model on a single workstation, pay zero per-token fees, and keep your source code on your own machine.

This post walks you end-to-end. Once Kronk is running locally, the lowest-friction way to put it to work is to leave VS Code Chat exactly where it is and re-point it at your local server. As of **VS Code 1.122**, the chat panel can be pointed at any OpenAI-compatible endpoint via the new Custom Endpoint BYOK provider. You keep the UI you already know — the model behind it just stops costing you per-token money. (If you'd rather drive Kronk from a terminal-native coding agent, the follow-up post [Drive Kronk From The Terminal With OpenCode](/blog/drive-kronk-from-the-terminal-with-opencode) picks up from this same Kronk server.)

Here's the running order:

1. Install Kronk and download a coding-grade model.
2. Verify everything works through the Kronk Browser UI.
3. Configure the model profile in `~/.kronk/model_config.yaml`.
4. Point VS Code Chat at Kronk.
5. Write some real code with it.

Plan on about thirty minutes, plus however long your internet connection needs to pull the model file (roughly 18 GB for the recommended model).

## Installing Kronk

Kronk is a Go-based local LLM runtime. It bundles a model server, a browser UI, an OpenAI-compatible REST API, and a CLI — all in a single binary. Under the hood it uses [llama.cpp](https://github.com/ggml-org/llama.cpp) for inference, reached through Ron Evans' [yzma](https://github.com/hybridgroup/yzma) Go bindings, with hardware acceleration on Metal (macOS), CUDA (NVIDIA), Vulkan (cross-vendor), and ROCm (AMD). There is no Python, no Docker, no CGO build chain.

**Prerequisites**

- Go 1.26 or later (only required if you install via `go install`).
- A modern GPU is strongly recommended. On Apple Silicon, the integrated GPU is plenty; on Linux/Windows, anything with 8 GB+ of VRAM will get you started, 24 GB+ to run a 30B-class coding model comfortably.
- 16 GB system RAM minimum; 32 GB+ recommended for the model we'll be downloading.

**Install the CLI**

The easiest install on macOS and Linux is through Homebrew:

```shell
brew tap ardanlabs/kronk
brew install kronk
```

If you prefer Go, this works on every supported platform:

```shell
go install github.com/ardanlabs/kronk/cmd/kronk@latest
```

There are also pre-built binaries for every release on the [GitHub releases page](https://github.com/ardanlabs/kronk/releases) and pre-built Docker images on GHCR — see Chapter 2 of the Kronk manual for those.

Verify the install:

```shell
kronk --help
```

You should see the command list — `server`, `model`, `catalog`, `libs`, `security`, `run`.

**Start the server**

```shell
kronk server start
```

On first run, Kronk auto-detects your hardware (Metal, CUDA, Vulkan, or CPU) and downloads the matching llama.cpp shared libraries to `~/.kronk/libraries/`. It also seeds `~/.kronk/model_config.yaml` with a default per-model configuration that you can edit later. When it's done, you'll see:

```
Kronk Model Server started
API: http://localhost:11435
BUI: http://localhost:11435
```

That's it. Kronk is running and listening on port 11435 with an OpenAI-compatible API and a browser UI on the same port. To run it in the background, use `kronk server start -d`; to stop it, `kronk server stop`.

## Downloading the Qwen3.6 Model

For coding work, the model we recommend is **Qwen3.6-35B-A3B**, an Unsloth-quantized MoE (mixture-of-experts) model that activates only 3B parameters per token. That gives you the quality of a 35B model with the inference speed of a 3B model — which is exactly the trade-off you want for an interactive coding agent.

We'll use the Q4_K_M quantization for the rest of this walkthrough. It weighs in around 18 GB on disk and fits comfortably in 24 GB of GPU VRAM with a 128k-token context window. If you have more VRAM (48 GB+), grab the Q8_K_XL quantization for a small quality bump.

**Pull the model via CLI**

```shell
kronk model pull Qwen3.6-35B-A3B-UD-Q4_K_M --local
```

Or pull the Q8 if you have the VRAM

```shell
kronk model pull Qwen3.6-35B-A3B-UD-Q8_K_XL --local
```

The `--local` flag tells the CLI to do the work directly against your filesystem instead of dispatching through the running server. Either form works; the local form gives you nicer progress output. The model lands under `~/.kronk/models/unsloth/Qwen3.6-35B-A3B-GGUF/`.

**Or pull it from the Browser UI**

If you'd rather click than type, open the BUI:

```
http://localhost:11435
```

Navigate to **Catalog → List**, find `Qwen3.6-35B-A3B-UD-Q4_K_M`, and click the download button. The catalog screen shows file sizes, quantization variants, and a live download progress bar.

While you're there, take a minute to explore the rest of the BUI sidebar — Models (what you have downloaded), Libraries (the llama.cpp installs Kronk is using), Security (API keys and tokens), and Apps (interactive tools). We'll come back to Apps in a moment.

## Testing the Model Using KMS and BUI

Before we use the model in our coding agent, let's verify the model loads and responds. We'll do this two ways: through the API directly, and through the BUI's built-in chat app.

**Quick API smoke test**

```shell
curl http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.6-35B-A3B-UD-Q4_K_M",
    "messages": [{"role": "user", "content": "Write a Go function that reverses a string."}],
    "max_tokens": 256
  }'
```

Or

```shell
curl http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.6-35B-A3B-UD-Q8_K_XL",
    "messages": [{"role": "user", "content": "Write a Go function that reverses a string."}],
    "max_tokens": 256
  }'
```

The first request takes a few seconds — Kronk has to load the model into memory and warm the GPU. Subsequent requests are near-instant. You should see a streaming JSON response with a working Go function in it.

**Chat from the BUI**

Open the BUI at `http://localhost:11435` and click **Apps → Chat**. Select `Qwen3.6-35B-A3B-UD-Q4_K_M` or `Qwen3.6-35B-A3B-UD-Q8_K_XL` from the model dropdown, drop in a system prompt if you like, and start a conversation.

This is the fastest way to sanity-check that the model behaves the way you expect before you let an autonomous agent loose on your filesystem. Push it on some real questions — Go idioms, SQL queries, whatever your day looks like. If you're not happy with the responses, tweak the sampling parameters in `~/.kronk/model_config.yaml` and restart the server.

You can also peek at the **Models → Running** page in the BUI to see what's loaded, how much VRAM it's using, and the current KV cache state. This is where you'll spend time if you start tuning context windows or running multiple models concurrently.

## Configure the Model Profile in Kronk

Before you point any client at Kronk, take a minute to look at `~/.kronk/model_config.yaml`. Every model name Kronk serves carries a **profile suffix** — for example, `Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT`. That `/AGENT` part selects a per-model configuration block in this file where you set the context window, sampling parameters, and KV cache slot count. The VS Code Chat path below uses these `/AGENT` model names, so the entry has to exist or your request will be rejected with an unknown-model error.

Open the file. If you pulled the Q8 quantization, you'll already find an entry pre-populated by Kronk on first run:

```yaml
Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 2
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

If you pulled Q4_K_M instead (or want to register both), add a sibling entry next to it:

```yaml
Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT:
  context-window: 131072
  nseq-max: 1
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

**About `nseq-max`**

`nseq-max` is the number of independent KV cache slots Kronk reserves for that model. Each slot can hold a separate conversation prefix in memory, which lets multiple in-flight requests against the same model proceed in parallel without evicting each other's cache.

Most coding agents — Cursor, Claude Code, Cline, OpenCode's defaults — fire **two concurrent requests per turn**: the main conversation request, plus a short "summarize this thread for the tab title" sub-request. If you only have one slot, the title request lands on top of your main conversation, blows out the cached prefix, and now every turn pays the full prefill cost again. That's why the file ships with `nseq-max: 2`.

What you set it to depends on which client you're going to use:

- **VS Code Chat.** Observed to issue one request at a time on session start (no parallel title sub-call), so `nseq-max: 1` is fine and frees up roughly half the KV cache memory.
- **Anything else** (Cursor, Cline, or any host that fires parallel sub-agent calls): leave `nseq-max: 2`. The follow-up [OpenCode walkthrough](/blog/drive-kronk-from-the-terminal-with-opencode) ships a bundle that disables the parallel title sub-agent, so `nseq-max: 1` is enough there too.

If you change anything in this file, restart the server so the new config is picked up:

```shell
kronk server stop && kronk server start
```

With the profile in place, you can wire up a client.

## Stay in VS Code Chat — Just Swap the Model

With Kronk running and a model loaded, the lowest-friction way to put it to work is to leave the VS Code chat panel exactly where it is and re-point it at your local server. The new **Custom Endpoint** BYOK provider (shipped in **VS Code 1.122**) can route the chat panel, agent mode, and tool calling at any OpenAI-compatible URL — and that includes Kronk.

A few things to know up front:

- You need **VS Code 1.122 or later**. Earlier versions only ship the older `github.copilot.chat.customOAIModels` setting, which Microsoft has marked deprecated. Check **Code → About Visual Studio Code** if you're not sure.
- BYOK powers **chat, agent mode, and tool calling**. Inline code completions and semantic search still require a Copilot subscription — those are not BYOK-able yet.
- You can run BYOK fully signed out of GitHub. If you do, you'll want to point VS Code's utility models at Kronk too so title generation and commit messages keep working.

**Wire it up**

1. Open the Command Palette (`⇧⌘P` on macOS, `Ctrl+Shift+P` elsewhere) → **Chat: Manage Language Models** → **Add Models** → **Custom Endpoint**.
2. Fill in the wizard:
   - **Group name** → `Kronk`
   - **Display name** → `Kronk`
   - **API key** → any non-empty string (e.g. `none`). Kronk doesn't validate it by default, but VS Code requires a value.
   - **API type** → **Chat Completions**
3. VS Code opens a file called `chatLanguageModels.json`. Replace the contents with:

```json
[
  {
    "name": "Kronk",
    "vendor": "customendpoint",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT",
        "name": "Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT",
        "url": "http://127.0.0.1:11435/v1",
        "apiType": "chat-completions",
        "toolCalling": true,
        "vision": true,
        "maxInputTokens": 131072,
        "maxOutputTokens": 65536
      }
    ]
  }
]
```

Save the file. Restart VS Code if the model doesn't immediately appear in the chat model picker.

4. Open the chat panel, click the model picker, and select **Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT** under the **Kronk** group. Chat as usual.

**Try it**

Type a quick smoke test into the chat panel:

> Hello! Reply with one sentence so I know you're alive.

You should get a response back within a second or two. The very first message after the model loads may take a few seconds longer — Kronk has to warm the KV cache and ingest the system prompt — but everything from there is near-instant.

Once you're sure the wiring is good, try something useful. Open any source file in the editor, then ask in chat:

> Summarize what this file does in five bullet points.

If you see a real summary tied to your code, you're done — VS Code Chat is now talking to your local model.

**Heads up: VS Code Chat still requires a GitHub sign-in**

One wrinkle Microsoft doesn't advertise. Even though the BYOK Custom Endpoint setting suggests you can use VS Code Chat fully signed out, in practice the first reload of VS Code after enabling Chat will force you to sign in with a GitHub account. The Chat UI is gated behind a GitHub identity, even when none of your model traffic goes through Microsoft.

In practical terms this costs you nothing. A free GitHub account is all you need — no Copilot subscription, no usage meter — and once you're signed in your chat turns still flow to your local Kronk server. If you don't want a GitHub account on the machine at all, skip this path entirely and use the terminal-native [OpenCode walkthrough](/blog/drive-kronk-from-the-terminal-with-opencode) instead.

**Leave `chat.utilityModel` and `chat.utilitySmallModel` alone**

VS Code has two settings — `chat.utilityModel` and `chat.utilitySmallModel` — that control which model handles the background "utility" tasks Chat fires off behind every conversation: title generation, summaries, commit messages, rename suggestions, intent detection, the little "progress message" prompts, and so on. Per the [official VS Code docs](https://code.visualstudio.com/docs/copilot/customization/language-models) both default to "Default", and the behavior splits based on whether you're signed in to GitHub Copilot:

- **Signed in to GitHub Copilot.** Utility tasks route to GitHub Copilot's built-in utility models — not Kronk. Your main chat model stays whatever you pick in the model picker. Net effect on Kronk: zero background traffic, only your actual chat turns hit it.
- **Not signed in to Copilot (free GitHub account, BYOK only).** The built-in utility models aren't available. VS Code pops a notification in the Chat view asking you to configure utility models, and the utility features (titles, commit messages, etc.) just won't work until you set them. The main chat still works fine.

It's tempting — especially in the not-signed-in case — to "fix" the warning by pointing the utility models at Kronk:

```json
// Don't do this.
"chat.utilityModel": "customendpoint/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT",
"chat.utilitySmallModel": "customendpoint/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT"
```

Be careful here. On every chat turn VS Code will fire up to **four concurrent requests** at Kronk — your main turn plus a stack of utility calls — all hitting the same model. If your `model_config.yaml` has `nseq-max: 1` (or even `2`), the utility requests will collide with the main turn, blow out the cached prefix, and every interaction pays a full prefill cost. The "saved" titles and commit messages aren't worth that latency.

You have two options:

- **Leave the utility settings unset.** Easiest path. You lose the title and commit-message niceties in the chat panel, but every chat turn stays fast and your KV cache survives.
- **Bump `nseq-max` to `4` and turn the utility models on.** Kronk supports up to four parallel KV cache slots on the same model — one per concurrent request — so titles, summaries, and commit messages all run locally without evicting each other. The cost is VRAM: each extra slot reserves another full context window worth of KV cache, so plan on roughly 4x the cache budget you'd use at `nseq-max: 1`. On a 48 GB+ GPU this is comfortable; on a 24 GB card it usually means dropping the context window or the Q-level.

If you take the `nseq-max: 4` route, update the model entry in `~/.kronk/model_config.yaml`:

```yaml
Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 4
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

Restart the server, then point the utility settings at Kronk. Watch the **Models → Running** page in the BUI on your next chat turn — you should see all four slots light up simultaneously.

A couple other gotchas worth knowing:

- The `url` field must be the OpenAI-compatible **base** URL — `http://127.0.0.1:11435/v1`, not `/v1/chat/completions`. VS Code appends the path itself.
- If you pulled the Q4_K_M quantization instead of Q8_K_XL, change the `id` and `name` strings to `Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT` to match what's in your `~/.kronk/model_config.yaml`.
- The configuration file can be re-opened any time from **Chat: Manage Language Models** → pencil icon next to the Kronk group.

That's the entire VS Code path. Kronk is running locally, the chat panel is talking to it, and every turn is going through your own GPU instead of Microsoft's meter.

**Cost so far: $0.**

## Conclusion

The Copilot pricing change is forcing a question every developer should already have been asking: _do I actually need to rent a model from a hyperscaler to do my job?_

For a lot of real-world coding work, the answer is no. A capable open-source MoE model on a workstation-class GPU, served by Kronk and driven from VS Code Chat, will handle the same iterative refactors, test-writing, and code-reading loops you were doing in Copilot Chat — without a per-token meter, without a procurement conversation, and without your source code leaving your laptop.

You don't have to throw away cloud models forever. There are problems where Claude or GPT-5 is still the right tool. But you no longer have to pay the Copilot tax just to get a competent assistant for day-to-day work. The local stack is genuinely good now, and it's free.

A few next steps if you want to keep going:

- **Drive Kronk from the terminal.** If the IDE isn't where you want to live, the follow-up post [Drive Kronk From The Terminal With OpenCode](/blog/drive-kronk-from-the-terminal-with-opencode) wires the same Kronk server to a terminal-native coding agent, complete with the Kronk MCP tools and ready-made agent skills.
- **Tune the model for your hardware.** Open `~/.kronk/model_config.yaml` and adjust `context-window`, `nseq-max`, and the KV cache quantization (`cache-type-k`, `cache-type-v`). Chapter 3 of the [Kronk manual](https://github.com/ardanlabs/kronk/blob/main/.manual/chapter-03-model-configuration.md) walks through the trade-offs.
- **Try other coding models.** The catalog includes Gemma, GPT-OSS, and several other open MoE and dense models. Add an `/AGENT` variant in `model_config.yaml` and swap the model `id` and `name` in your VS Code Custom Endpoint config to point at it.
- **Wire up speech-to-text.** Kronk's Bucky subsystem runs whisper.cpp models from the same server for dictating prompts. See Chapter 18.
- **Embed it in your own apps.** The Kronk Go SDK is the same code the model server is built on. Load models, run inference, and manage caching directly from your Go programs — no server required.
- **Check out [yzma](https://github.com/hybridgroup/yzma).** Kronk reaches `llama.cpp` through `yzma`, Ron Evans' Go-native binding from the Hybrid Group (the TinyGo and Gobot folks). If you want a thinner wrapper for writing Go apps that talk to `llama.cpp` directly — especially on edge hardware like an Arduino UNO Q — yzma is well worth a look, and a tip of the hat for blazing the trail.

Microsoft pulled the rug. You don't have to stand on it.
