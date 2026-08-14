---
title: "Free Yourself From The Copilot Tax"
date: "2026-06-02"
slug: "free-yourself-from-the-copilot-tax"
excerpt: "GitHub Copilot's switch to token-based billing is turning $29 subscriptions into $750 bills overnight, and developers are right to be furious. This post shows you how to walk away from the meter entirely — install Kronk, run a 4B coding model that fits in 16 GB of VRAM, point VS Code Chat at it, and get back to writing code without watching a usage counter tick. With more VRAM you can scale up to a 35B MoE with one config change."
author: "bill-kennedy"
banner: "/blog/images/post7_banner.jpg"
ogImage: "/blog/images/post7_twitter.jpg"
---

## Introduction

On June 1st, Microsoft flipped GitHub Copilot from a flat-rate subscription to a token-usage billing model — and the developer community has not taken it well.

[https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/](https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/)

The reactions on Reddit and X have been brutal. One developer reported their bill jumping from around $29 per month to nearly $750. Another shared a screenshot showing a jump from $50 to roughly $3,000. The pattern is hard to miss: Microsoft spent two years training developers to lean on the chat panel for everything — multi-step refactors, agent loops, sub-agent fan-outs — and then changed the meter so that exact behavior is the most expensive thing you can do.

If you're an enterprise with a procurement department, you'll absorb the change. If you're an individual developer, a small team, or a contractor paying out of your own pocket, you're now staring at a usage curve that can swing by 10x or 100x from one busy day to the next. That is not a tool — that is a liability.

The good news is that you no longer need a hyperscaler subscription to get a capable coding assistant. The open-source models released in the last twelve months are genuinely good at writing and editing code, and the tooling to run them locally has caught up. With **Kronk** as your local model server, you can run a competent 4B coding model on a laptop-class 16 GB GPU and get real work done — refactors, completions, small-feature work, the same loops you were firing at Copilot Chat. If you have a workstation-class GPU you can scale up to a 35B-parameter MoE for a real quality jump. Either way, you pay zero per-token fees and your source code never leaves your machine.

This post walks you end-to-end. Once Kronk is running locally, the lowest-friction way to put it to work is to leave VS Code Chat exactly where it is and re-point it at your local server. As of **VS Code 1.122**, the chat panel can be pointed at any OpenAI-compatible endpoint via the new Custom Endpoint BYOK provider. You keep the UI you already know — the model behind it just stops costing you per-token money. (If you'd rather drive Kronk from a terminal-native coding agent, the follow-up post [Drive Kronk From The Terminal With OpenCode](/blog/drive-kronk-from-the-terminal-with-opencode) picks up from this same Kronk server.)

Here's the running order:

1. Install Kronk and download a coding-grade model.
2. Verify everything works through the Kronk Browser UI.
3. Configure the model profile in `~/.kronk/models/model_config.yaml`.
4. Point VS Code Chat at Kronk.
5. Write some real code with it.

Plan on about thirty minutes, plus however long your internet connection needs to pull the model file (roughly 5 GB for the recommended model).

## Installing Kronk

Kronk is a Go-based local LLM runtime. It bundles a model server, a browser UI, an OpenAI-compatible REST API, and a CLI — all in a single binary. Under the hood it uses [llama.cpp](https://github.com/ggml-org/llama.cpp) for inference, reached through Ron Evans' [yzma](https://github.com/hybridgroup/yzma) Go bindings, with hardware acceleration on Metal (macOS), CUDA (NVIDIA), Vulkan (cross-vendor), and ROCm (AMD). There is no Python, no Docker, no CGO build chain.

**Prerequisites**

- Go 1.26 or later (only required if you install via `go install`).
- A modern GPU is strongly recommended. On Apple Silicon, an M-series Mac with 16 GB of unified memory is plenty; on Linux/Windows, 16 GB+ of VRAM runs the recommended model comfortably. If you have 24 GB or more, you can step up to a 35B-class MoE model — we cover that near the end of the post.
- 16 GB system RAM minimum; more never hurts.

**Install the CLI**

The easiest install on macOS and Linux is through Homebrew:

```shell
brew install ardanlabs/kronk/kronk
```

The fully qualified name adds the tap and trusts only the Kronk formula rather
than every current and future item in the tap.

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

On first run, Kronk auto-detects your hardware (Metal, CUDA, Vulkan, or CPU) and downloads the matching llama.cpp shared libraries to `~/.kronk/libraries/`. It also seeds `~/.kronk/models/model_config.yaml` with a default per-model configuration that you can edit later. When it's done, you'll see:

```
Kronk Model Server started
API: http://localhost:11435
BUI: http://localhost:11435
```

That's it. Kronk is running and listening on port 11435 with an OpenAI-compatible API and a browser UI on the same port. To run it in the background, use `kronk server start -d`; to stop it, `kronk server stop`.

## Downloading the Qwopus3.5-4B-Coder Model

For very basic coding work that runs on any modern GPU, the model I recommend trying is **Qwopus3.5-4B-Coder**, a 4-billion-parameter coding model quantized to Q8_0. It weighs in around 5 GB on disk, runs in roughly 14 GB of VRAM with a 72k-token context window, and is decent enough to play with.

If I'm being honest, to handle the day-to-day refactors, completions, and small-feature work, you want to run the Qwen3.6 model requiring a minimum of 24GB of VRAM. If you have that much VRAM check out the [Upgrading to Qwen3.6](#upgrading-to-qwen36-when-you-have-more-vram) section near the end of this post since it walks you through using the Qwen3.6 model.

**Pull the model via CLI**

```shell
kronk model pull --local "mradermacher/Qwopus3.5-4B-Coder.Q8_0"
```

The `--local` flag tells the CLI to do the work directly against your filesystem instead of dispatching through the running server. Either form works; the local form gives you nicer progress output. The model lands under `~/.kronk/models/`.

**Or pull it from the Browser UI**

If you'd rather click than type, open the BUI:

```
http://localhost:11435
```

Navigate to **Catalog → List**, find `Qwopus3.5-4B-Coder.Q8_0`, and click the download button. The catalog screen shows file sizes, quantization variants, and a live download progress bar.

While you're there, take a minute to explore the rest of the BUI sidebar — Models (what you have downloaded), Libraries (the llama.cpp installs Kronk is using), Security (API keys and tokens), and Apps (interactive tools). We'll come back to Apps in a moment.

## Testing the Model Using KMS and BUI

Before we use the model in our coding agent, let's verify the model loads and responds. We'll do this two ways: through the API directly, and through the BUI's built-in chat app.

**Quick API smoke test**

```shell
curl http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT",
    "messages": [{"role": "user", "content": "Write a Go function that reverses a string."}],
    "max_tokens": 256
  }'
```

The first request takes a few seconds — Kronk has to load the model into memory and warm the GPU. Subsequent requests are near-instant. You should see a streaming JSON response with a working Go function in it.

**Chat from the BUI**

Open the BUI at `http://localhost:11435` and click **Apps → Chat**. Select `Qwopus3.5-4B-Coder.Q8_0` from the model dropdown, drop in a system prompt if you like, and start a conversation.

This is the fastest way to sanity-check that the model behaves the way you expect before you let an autonomous agent loose on your filesystem. Push it on some real questions — Go idioms, SQL queries, whatever your day looks like.

You can also peek at the **Models → Running** page in the BUI to see what's loaded, how much VRAM it's using, and the current KV cache state. This is where you'll spend time if you start tuning context windows or running multiple models concurrently.

## Customize the Model Configuration in Kronk

Before you point any client at Kronk, take a look at the `~/.kronk/models/model_config.yaml` file. Any model you use can have customized configuration settings placed in this file. You can create different configuration versions for the same model by applying a string like `/AGENT` to the model id. For the best known coding models, Kronk gives you settings already.

Open the file and you'll find these models listed in the file.

```yaml
unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 2
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95

unsloth/gemma-4-26B-A4B-it-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 2
  sampling-parameters:
    temperature: 1.0
    top_k: 64
    top_p: 0.95

mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT:
  context-window: 73728
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

For the `Qwopus3.5-4B-Coder.Q8_0` model, you can see the config increases the context window to 72K. Sampling parameters are tuned for the Qwopus instruction format. You don't have to change anything to follow the rest of this post.

**About `nseq-max`**

You'll notice there's no `nseq-max` line in the Qwopus block. `nseq-max` is the number of independent KV cache slots Kronk reserves for the model — each slot can hold a separate conversation prefix in memory, which lets multiple in-flight requests against the same model proceed in parallel without evicting each other's cache. When it's not set, Kronk reserves **one slot**, which is exactly the right default if your goal is to fit in the smallest amount of VRAM and you're driving the model from a single-user client like VS Code Chat. With one slot and the full 73k context window, Qwopus comes in around 14 GB of VRAM.

Most coding agents — Cursor, Cline, OpenCode's defaults — fire **two concurrent requests per turn**: the main conversation request, plus a short "summarize this thread for the tab title" sub-request. If you only have one slot, the title request lands on top of your main conversation, blows out the cached prefix, and now every turn pays the full prefill cost again. If that's the client you plan to use, add `nseq-max: 2` to the block above and restart the server — the extra slot costs roughly 2 GB more VRAM on Qwopus:

```yaml
mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT:
  context-window: 73728
  nseq-max: 2
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

VS Code Chat — the path we're about to wire up — only issues one request at a time on session start, so the default single-slot setup is fine.

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
        "id": "mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT",
        "name": "mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT",
        "url": "http://127.0.0.1:11435/v1",
        "apiType": "chat-completions",
        "toolCalling": true,
        "vision": true,
        "maxInputTokens": 73728,
        "maxOutputTokens": 73728
      }
    ]
  }
]
```

Save the file. Restart VS Code if the model doesn't immediately appear in the chat model picker.

4. Open the chat panel, click the model picker, and select **mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT** under the **Kronk** group. Chat as usual.

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
// Think before doing this.
"chat.utilityModel": "mradermacher/customendpoint/Qwopus3.5-4B-Coder.Q8_0/AGENT",
"chat.utilitySmallModel": "mradermacher/customendpoint/Qwopus3.5-4B-Coder.Q8_0/AGENT"
```

The catch is concurrency. On every chat turn VS Code can fire up to **four concurrent requests** at Kronk — your main turn plus a stack of utility calls — all hitting the same model. If your `model_config.yaml` is at the default `nseq-max: 1` (or even `2`), the utility requests will collide with the main turn, blow out the cached prefix, and every interaction pays a full prefill cost.

You have two options:

- **Leave the utility settings unset.** Easiest path. You lose the title and commit-message niceties in the chat panel, but every chat turn stays fast and your KV cache survives.
- **Bump `nseq-max` to `4` and turn the utility models on.** Kronk supports up to four parallel KV cache slots on the same model — one per concurrent request — so titles, summaries, and commit messages all run locally without evicting each other. Because Qwopus is only 4B parameters, the cost is modest: roughly 6 GB of extra VRAM on top of the 14 GB baseline, putting you in the ~20 GB range. Fine on a 24 GB card, tight on a 16 GB card (you'd want to drop the context window first).

If you take the `nseq-max: 4` route, update the model entry in `~/.kronk/models/model_config.yaml`:

```yaml
mradermacher/Qwopus3.5-4B-Coder.Q8_0/AGENT:
  context-window: 73728
  nseq-max: 4
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

Restart the server, then point the utility settings at Kronk. Watch the **Models → Running** page in the BUI on your next chat turn — you should see all four slots light up simultaneously.

A couple other gotchas worth knowing:

- The `url` field must be the OpenAI-compatible **base** URL — `http://127.0.0.1:11435/v1`, not `/v1/chat/completions`. VS Code appends the path itself.
- The configuration file can be re-opened any time from **Chat: Manage Language Models** → pencil icon next to the Kronk group.

That's the entire VS Code path. Kronk is running locally, the chat panel is talking to it, and every turn is going through your own GPU instead of Microsoft's meter.

**Cost so far: $0.**

## Upgrading to Qwen3.6 When You Have More VRAM

Qwopus3.5-4B-Coder is a solid on-ramp, but a 4B model has a real ceiling. If you have a 24 GB or 48 GB+ GPU, you can swap in **Qwen3.6-35B-A3B** — an Unsloth-quantized MoE (mixture-of-experts) model that activates only 3B parameters per token, giving you the quality of a 35B model with the inference speed of a 3B model. That's exactly the trade-off you want for an interactive coding agent, and the quality jump over Qwopus on multi-file refactors, larger codebase reasoning, and trickier algorithm work is meaningful.

Two quantizations are worth considering, both pulled by name:

| VRAM available | Recommended model            | Notes                                              |
| -------------- | ---------------------------- | -------------------------------------------------- |
| 24 GB          | `Qwen3.6-35B-A3B-UD-Q4_K_M`  | ~24 GB at `nseq-max: 1`, 128k context              |
| 48 GB+         | `Qwen3.6-35B-A3B-UD-Q8_K_XL` | ~47 GB at `nseq-max: 1`, 128k context, top quality |

**Step 1: pull the model**

```shell
kronk model pull Qwen3.6-35B-A3B-UD-Q4_K_M --local
```

Or for the Q8:

```shell
kronk model pull Qwen3.6-35B-A3B-UD-Q8_K_XL --local
```

The file lands under `~/.kronk/models/unsloth/Qwen3.6-35B-A3B-GGUF/`.

**Step 2: register the agent profile**

The Q8 profile is already pre-seeded by Kronk in `~/.kronk/models/model_config.yaml` — but with `nseq-max: 2` (for the Cursor/Cline two-request pattern). If you want the smallest VRAM footprint for VS Code Chat, edit the block and drop `nseq-max` down to `1`:

```yaml
unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 1
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

That's what gets you the ~47 GB number. Leave `nseq-max: 2` if you'll also drive Kronk from a parallel-request client.

If you pulled Q4_K_M, the profile isn't seeded — add it as a sibling entry:

```yaml
unsloth/Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT:
  context-window: 131072
  nseq-max: 1
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

Restart the server:

```shell
kronk server stop && kronk server start
```

**Step 3: update the VS Code Custom Endpoint config**

Re-open `chatLanguageModels.json` from **Chat: Manage Language Models** → pencil icon next to the Kronk group. Swap the `id`, `name`, and token limits to match the model you pulled:

```json
{
  "id": "unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT",
  "name": "unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT",
  "url": "http://127.0.0.1:11435/v1",
  "apiType": "chat-completions",
  "toolCalling": true,
  "vision": true,
  "maxInputTokens": 131072,
  "maxOutputTokens": 131072
}
```

For Q4_K_M, use `unsloth/Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT` in both `id` and `name` instead. Restart VS Code, pick the new model in the chat model picker, and you're done.

**You can keep both models registered.** Add a second entry to the `models` array in `chatLanguageModels.json` (Qwopus and Qwen3.6 side by side), and they'll both show up in the chat picker. Switch between them per session — Qwopus when you want fast iteration on a small task, Qwen3.6 when you're tackling something the smaller model is fumbling.

## Conclusion

The Copilot pricing change is forcing a question every developer should already have been asking: _do I actually need to rent a model from a hyperscaler to do my job?_

For a lot of real-world coding work, the answer is no. A capable open-source model running on the GPU you already own — a 4B coder on a 16 GB laptop card, a 35B MoE on a workstation — served by Kronk and driven from VS Code Chat will handle the same iterative refactors, test-writing, and code-reading loops you were doing in Copilot Chat. Without a per-token meter, without a procurement conversation, and without your source code leaving your laptop.

You don't have to throw away cloud models forever. There are problems where Claude or GPT-5 is still the right tool. But you no longer have to pay the Copilot tax just to get a competent assistant for day-to-day work. The local stack is genuinely good now, and it's free.

A few next steps if you want to keep going:

- **Drive Kronk from the terminal.** If the IDE isn't where you want to live, the follow-up post [Drive Kronk From The Terminal With OpenCode](/blog/drive-kronk-from-the-terminal-with-opencode) wires the same Kronk server to a terminal-native coding agent, complete with the Kronk MCP tools and ready-made agent skills.
- **Tune the model for your hardware.** Open `~/.kronk/models/model_config.yaml` and adjust `context-window`, `nseq-max`, and the KV cache quantization (`cache-type-k`, `cache-type-v`). Chapter 3 of the [Kronk manual](https://github.com/ardanlabs/kronk/blob/main/.manual/chapter-03-model-configuration.md) walks through the trade-offs.
- **Try other coding models.** The catalog includes Gemma, GPT-OSS, and several other open MoE and dense models. Add an `/AGENT` variant in `model_config.yaml` and swap the model `id` and `name` in your VS Code Custom Endpoint config to point at it.
- **Wire up speech-to-text.** Kronk's Bucky subsystem runs whisper.cpp models from the same server for dictating prompts. See Chapter 18.
- **Embed it in your own apps.** The Kronk Go SDK is the same code the model server is built on. Load models, run inference, and manage caching directly from your Go programs — no server required.
- **Check out [yzma](https://github.com/hybridgroup/yzma).** Kronk reaches `llama.cpp` through `yzma`, Ron Evans' Go-native binding from the Hybrid Group (the TinyGo and Gobot folks). If you want a thinner wrapper for writing Go apps that talk to `llama.cpp` directly — especially on edge hardware like an Arduino UNO Q — yzma is well worth a look, and a tip of the hat for blazing the trail.

Microsoft pulled the rug. You don't have to stand on it.
