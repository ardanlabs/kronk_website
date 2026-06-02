---
title: "Free Yourself From The Copilot Tax"
date: "2026-06-02"
slug: "free-yourself-from-the-copilot-tax"
excerpt: "GitHub Copilot's switch to token-based billing is turning $29 subscriptions into $750 bills overnight, and developers are right to be furious. This post shows you how to walk away from the meter entirely — install Kronk and OpenCode, run a 30B coding model on your own hardware, and get back to writing code without watching a usage counter tick."
author: "bill-kennedy"
banner: "/blog/images/post7_banner.jpg"
ogImage: "/blog/images/post7_twitter.jpg"
---

## Introduction

On June 1st, Microsoft flipped GitHub Copilot from a flat-rate subscription to a token-usage billing model — and the developer community has not taken it well.

[https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/](https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/)

The reactions on Reddit and X have been brutal. One developer reported their bill jumping from around $29 per month to nearly $750. Another shared a screenshot showing a jump from $50 to roughly $3,000. The pattern is hard to miss: Microsoft spent two years training developers to lean on the chat panel for everything — multi-step refactors, agent loops, sub-agent fan-outs — and then changed the meter so that exact behavior is the most expensive thing you can do.

If you're an enterprise with a procurement department, you'll absorb the change. If you're an individual developer, a small team, or a contractor paying out of your own pocket, you're now staring at a usage curve that can swing by 10x or 100x from one busy day to the next. That is not a tool — that is a liability.

The good news is that you no longer need a hyperscaler subscription to get a capable coding assistant. The open-source models released in the last twelve months are genuinely good at writing and editing code, and the tooling to run them locally has caught up. With **Kronk** as your local model server and **OpenCode** as your terminal-based coding agent, you can run a 30B-parameter MoE coding model on a single workstation, pay zero per-token fees, and keep your source code on your own machine.

This post walks you end-to-end:

1. Turn off Copilot in VS Code so it stops nagging you.
2. Install Kronk and download a coding-grade model.
3. Verify everything works through the Kronk Browser UI.
4. Install OpenCode and point it at your local Kronk server.
5. Write some real code with it.

Plan on about thirty minutes, plus however long your internet connection needs to pull the model file (roughly 18 GB for the recommended model).

## Remove Copilot and AI features in VS Code

To remove or disable the Copilot Chat window and AI features in Visual Studio Code, you can use the built-in system setting or command palette toggles. If you want a quick toggle without diving into settings menus:

1. Open the Command Palette using Ctrl + Shift + P (or Cmd + Shift + P on macOS).

2. Type `Chat: Hide AI Features` and press Enter.

VS Code will hide the Chat view, the inline completion suggestions, and the AI feature affordances in the sidebar. If you want to bring them back later, run `Chat: Show AI Features` from the same palette. To uninstall Copilot entirely, open the Extensions view (`Cmd/Ctrl + Shift + X`), search for "GitHub Copilot" and "GitHub Copilot Chat", and click Uninstall on both.

With Copilot out of the way, you have a clean editor to wire up against Kronk.

## Installing Kronk

Kronk is a Go-based local LLM runtime. It bundles a model server, a browser UI, an OpenAI-compatible REST API, and a CLI — all in a single binary. Under the hood it uses [llama.cpp](https://github.com/ggml-org/llama.cpp) for inference, with hardware acceleration on Metal (macOS), CUDA (NVIDIA), Vulkan (cross-vendor), and ROCm (AMD). There is no Python, no Docker, no CGO build chain.

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

Before we wire OpenCode up, let's verify the model loads and responds. We'll do this two ways: through the API directly, and through the BUI's built-in chat app.

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

Open the BUI at `http://localhost:11435` and click **Apps → Chat**. Select `Qwen3.6-35B-A3B-UD-Q4_K_M` from the model dropdown, drop in a system prompt if you like, and start a conversation.

[IMAGE3: BUI Chat app with Qwen3.6 selected]

This is the fastest way to sanity-check that the model behaves the way you expect before you let an autonomous agent loose on your filesystem. Push it on some real questions — Go idioms, SQL queries, whatever your day looks like. If you're not happy with the responses, tweak the sampling parameters in `~/.kronk/model_config.yaml` and restart the server.

You can also peek at the **Models → Running** page in the BUI to see what's loaded, how much VRAM it's using, and the current KV cache state. This is where you'll spend time if you start tuning context windows or running multiple models concurrently.

## Installing OpenCode

[OpenCode](https://opencode.ai) is an open-source, terminal-native coding agent. Think Cursor or Claude Code, but it runs in your terminal and talks to any OpenAI-compatible endpoint — which includes Kronk.

**Install OpenCode**

```shell
curl -fsSL https://opencode.ai/install | bash
```

There are also Homebrew and npm installers — see [https://opencode.ai/download](https://opencode.ai/download) for the full list.

Verify it's on your `PATH`:

```shell
opencode --version
```

## Configuring OpenCode

The Kronk repo ships a ready-made OpenCode configuration bundle — provider config, MCP wiring, agent skills, and house rules — that installs in one command.

**Clone the Kronk repo (if you haven't already)**

```shell
git clone https://github.com/ardanlabs/kronk.git
cd kronk
```

**Install the OpenCode bundle**

```shell
make agents-default-opencode
```

This target copies four pieces into `~/.config/opencode/`:

1. `opencode.jsonc` — registers Kronk as a custom provider at `http://127.0.0.1:11435/v1` and pre-loads the Qwen3.6 model entry.
2. `auth.json` — a placeholder API key for local use (Kronk auth is off by default).
3. `AGENTS.md` — house rules for the agent: which skills to load, editing policy, the "don't curl the MCP port directly" rule.
4. `skills/` — at minimum the `kronk-mcp` skill (how to use Kronk's MCP tools) and `writing-go` (Go toolchain workflow with the post-edit `gofmt`/`vet`/`staticcheck` chain).

The bundle wires Kronk's MCP server (auto-started by `kronk server start` on `http://localhost:9000/mcp`) directly into OpenCode. That gives the agent two extra tools out of the box:

- **`web_search`** — Brave-powered web search, useful for looking up library docs, errors, or version info without leaving the terminal.
- **`fuzzy_edit`** — a tolerant fallback file editor for when OpenCode's exact-match edit tool misses on whitespace or line-ending drift.

**Update The Config**

The bundle ships pointed at `Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT` — the larger Q8 quantization with two KV cache sequences. If you pulled the Q4_K_M variant above (or you just want to leave more VRAM headroom on a smaller GPU), you need to make two small edits: one on the Kronk side, one on the OpenCode side.

**1. Add the Q4 variant to `~/.kronk/model_config.yaml`**

Open `~/.kronk/model_config.yaml`. You'll find the Q8 entry pre-populated:

```yaml
Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 2
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

Add a sibling entry for the Q4 quantization right next to it, and drop `nseq-max` to `1`:

```yaml
Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT:
  context-window: 131072
  nseq-max: 1
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

If you're sticking with the Q8 model instead, do the same edit in place on the existing Q8 block — change `nseq-max: 2` to `nseq-max: 1`:

```yaml
Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT:
  context-window: 131072
  nseq-max: 1
  sampling-parameters:
    temperature: 0.6
    top_k: 20
    top_p: 0.95
```

Save the file and restart the server (`kronk server stop && kronk server start`) so the new entry is picked up.

**Why `nseq-max: 1` is safe with OpenCode (and why you usually want `2`)**

`nseq-max` is the number of independent KV cache slots Kronk reserves for that model. Each slot can hold a separate conversation prefix in memory, which lets multiple in-flight requests against the same model proceed in parallel without evicting each other's cache.

Most coding agents — Cursor, Claude Code, Cline, OpenCode's defaults — fire **two concurrent requests per turn**: the main conversation request, plus a short "summarize this thread for the tab title" sub-request. If you only have one slot, the title request lands on top of your main conversation, blows out the cached prefix, and now every turn pays the full prefill cost again. That's why the bundle ships with `nseq-max: 2`.

The Kronk bundle's `opencode.jsonc` turns the title sub-agent **off**:

```jsonc
"agent": {
    "title": {
        "disable": true
    }
}
```

With the title request gone, there is only ever one in-flight request against the model, so a single slot is enough — and you get the VRAM back. If you swap to a different host (Cursor, Cline, OpenCode with the title agent re-enabled, anything that issues parallel sub-agent calls), put `nseq-max: 2` back. The second slot is the difference between an agent loop that stays fast and one that re-prefills 30k tokens every turn.

**2. Point OpenCode at the Q4 model in `~/.config/opencode/opencode.jsonc`**

Two places in `~/.config/opencode/opencode.jsonc` need updating: the top-level `model` field (the active default) and the `provider.kronk.models` map (the registered list OpenCode can switch between with the `/models` command).

Change the `model` field:

```jsonc
"model": "kronk/Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT",
```

And add a matching entry inside `provider.kronk.models` so the model shows up in the `/models` picker:

```jsonc
"models": {
    "Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT": {
        "name": "Qwen3.6 35B-A3B UD-Q4_K_M",
        "limit": {
            "context": 131072,
            "output": 65536
        }
    },
    "Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT": {
        "name": "Qwen3.6 35B-A3B UD-Q8_K_XL",
        "limit": {
            "context": 131072,
            "output": 65536
        }
    },
    "gemma-4-26B-A4B-it-UD-Q8_K_XL/AGENT": {
        "name": "Gemma4 26B-A4B UD-Q8_K_XL",
        "limit": {
            "context": 131072,
            "output": 65536
        }
    }
}
```

You can keep all three (or more) registered at the same time — Q4 as your default, Q8 for when you want extra quality, and Gemma4 as a second opinion. Inside OpenCode, the `/models` command pops up a picker so you can swap mid-session without restarting the agent.

## Testing OpenCode Against KMS

Launch OpenCode from the root of any project. You want to make sure OpenCode is running from the root of any project so it can gather context for itself.

```shell
opencode
```

OpenCode connects to Kronk, loads the configured agent skills, and drops you at a prompt. Try a real task — something that exercises file reading, editing, and running a command:

```
Read the README.md in this repo. Then add a new top-level section called
"Local Setup" that documents the three commands needed to clone, build, and
run the project. After editing, run `gofmt -s -w` on any Go files you
touched.
```

You'll watch the agent loop through:

1. Read the file.
2. Write the edit (using OpenCode's exact-match edit tool, or falling back to `kronk_fuzzy_edit` if whitespace drifts).
3. Run the shell command.
4. Summarize what changed.

While it works, glance at the Kronk BUI's **Models → Running** page and you'll see your prompt and KV cache state updating in real time. The first turn does a full prefill; every subsequent turn only ingests the new message thanks to Kronk's incremental message cache (IMC). That's what keeps an agent conversation usable when it grows to tens of thousands of tokens.

When you're done with a session, you can `kronk server stop` or just leave the server running — it idles cheap when nothing is hitting it.

**Cost so far: $0.**

## Conclusion

The Copilot pricing change is forcing a question every developer should already have been asking: _do I actually need to rent a model from a hyperscaler to do my job?_

For a lot of real-world coding work, the answer is no. A capable open-source MoE model on a workstation-class GPU, served by Kronk, and driven by OpenCode, will handle the same iterative refactors, test-writing, and code-reading loops you were doing in Copilot Chat — without a per-token meter, without a procurement conversation, and without your source code leaving your laptop.

You don't have to throw away cloud models forever. There are problems where Claude or GPT-5 is still the right tool. But you no longer have to pay the Copilot tax just to get a competent assistant for day-to-day work. The local stack is genuinely good now, and it's free.

A few next steps if you want to keep going:

- **Tune the model for your hardware.** Open `~/.kronk/model_config.yaml` and adjust `context-window`, `nseq-max`, and the KV cache quantization (`cache-type-k`, `cache-type-v`). Chapter 3 of the [Kronk manual](https://github.com/ardanlabs/kronk/blob/main/.manual/chapter-03-model-configuration.md) walks through the trade-offs.
- **Try other coding models.** The catalog includes Gemma, GPT-OSS, and several other open MoE and dense models. Add an `/AGENT` variant in `model_config.yaml`, register it in `opencode.jsonc`, and swap with `/models` inside OpenCode.
- **Wire up speech-to-text.** Kronk's Bucky subsystem runs whisper.cpp models from the same server for dictating prompts. See Chapter 18.
- **Embed it in your own apps.** The Kronk Go SDK is the same code the model server is built on. Load models, run inference, and manage caching directly from your Go programs — no server required.

Microsoft pulled the rug. You don't have to stand on it.
