---
title: "Drive Kronk From The Terminal With OpenCode"
date: "2026-06-03"
slug: "drive-kronk-from-the-terminal-with-opencode"
excerpt: "If you'd rather skip the IDE entirely, OpenCode is a terminal-native coding agent that talks to any OpenAI-compatible endpoint — including the Kronk server you set up in the previous post. This walkthrough installs OpenCode, drops in the Kronk configuration bundle, wires up the MCP tools, and puts the whole loop to work on a real task."
author: "bill-kennedy"
banner: "/blog/images/post8_banner.jpg"
ogImage: "/blog/images/post8_twitter.jpg"
---

## Introduction

In the previous post, [Free Yourself From The Copilot Tax](/blog/free-yourself-from-the-copilot-tax), we got Kronk running locally and pointed VS Code Chat at it. That covers the lowest-friction path off the Copilot meter — keep the UI you already use, swap the model behind it. This post picks up from the same Kronk server and shows you the other path: a fully terminal-native coding agent driven by [OpenCode](https://opencode.ai).

If you have not yet installed Kronk, downloaded a coding model, and configured a `/AGENT` profile in `~/.kronk/models/model_config.yaml`, start with the previous post. Everything below assumes:

- Kronk is running on `http://localhost:11435`.
- You have pulled one of `unsloth/Qwen3.6-35B-A3B-UD-Q4_K_M` or `unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL`.
- The matching `/AGENT` entry exists in `~/.kronk/models/model_config.yaml`.

With that out of the way, the running order for this post is:

1. Install OpenCode.
2. Drop in the Kronk OpenCode configuration bundle.
3. Point OpenCode at the model you pulled.
4. Run a real task end-to-end against your local stack.

You can keep the VS Code path from the previous post running side by side — both clients talk to the same Kronk server, so nothing has to be torn down.

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

If you want different settings on a per-project basis — a different default model, an extra MCP server, project-specific agent rules — drop an `opencode.jsonc` in the root of that project. OpenCode merges the project-level file on top of the user-level one in `~/.config/opencode/`, so the project file wins for anything it defines and the user-level config fills in everything else. That keeps the global defaults sane and lets each repo override just what it needs.

The bundle wires Kronk's MCP server (auto-started by `kronk server start` on `http://localhost:9000/mcp`) directly into OpenCode. That gives the agent two extra tools out of the box:

- **`web_search`** — Brave-powered web search, useful for looking up library docs, errors, or version info without leaving the terminal.
- **`fuzzy_edit`** — a tolerant fallback file editor for when OpenCode's exact-match edit tool misses on whitespace or line-ending drift.

`web_search` is wired to the [Brave Search API](https://brave.com/search/api/) on purpose — going through an official API keeps us inside Brave's terms of use rather than scraping a search engine that forbids it. To turn it on, grab an API key from the Brave dashboard and export it in the shell that launches Kronk:

```shell
export KRONK_MCP_BRAVE_API_KEY="your-brave-api-key"
```

Brave's pay-as-you-go pricing is roughly **$5 per 1,000 requests**, with a free tier for light use. For a single developer doing day-to-day coding lookups, that's effectively rounding error compared to a Copilot token bill — but it is metered, so put the key in your shell profile and forget about it.

**Why `nseq-max: 1` works with the OpenCode bundle**

The bundle's `opencode.jsonc` turns the title sub-agent **off**:

```jsonc
"agent": {
    "title": {
        "disable": true
    }
}
```

With the title request gone there is only ever one in-flight request against the model, so a single KV cache slot in `~/.kronk/models/model_config.yaml` is enough. If you later swap to a host that does fire parallel sub-agent calls (Cursor, Cline, OpenCode with the title agent re-enabled), bump `nseq-max` back to `2`.

**Point OpenCode at the right model**

The bundle ships pointed at `unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT`. If you stayed on the Q8 quantization, you can skip the rest of this section and jump straight to using OpenCode. If you pulled Q4_K_M instead, two places in `~/.config/opencode/opencode.jsonc` need updating: the top-level `model` field (the active default) and the `provider.kronk.models` map (the registered list OpenCode can switch between with the `/models` command).

Change the `model` field:

```jsonc
"model": "kronk/unsloth/Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT",
```

And add a matching entry inside `provider.kronk.models` so the model shows up in the `/models` picker:

```jsonc
"models": {
    "unsloth/Qwen3.6-35B-A3B-UD-Q4_K_M/AGENT": {
        "name": "Qwen3.6 35B-A3B UD-Q4_K_M",
        "limit": {
            "context": 131072,
            "output": 65536
        }
    },
    "unsloth/Qwen3.6-35B-A3B-UD-Q8_K_XL/AGENT": {
        "name": "Qwen3.6 35B-A3B UD-Q8_K_XL",
        "limit": {
            "context": 131072,
            "output": 65536
        }
    },
    "unsloth/gemma-4-26B-A4B-it-UD-Q8_K_XL/AGENT": {
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

Between this post and the previous one, you now have two complete off-ramps from the Copilot meter — VS Code Chat for when you want to stay in the IDE, and OpenCode for when you want a terminal-native agent driving the same Kronk server. Pick whichever fits the moment; nothing stops you from running both at once.

A few next steps if you want to push the OpenCode setup further:

- **Tune the agent skills.** The bundle's `skills/` directory is just a starting point. Drop your own SKILL.md files in there for project-specific workflows, code-review checklists, or in-house conventions.
- **Add more MCP servers.** The Kronk MCP server is wired up by default, but OpenCode happily talks to any MCP server. Add filesystem servers, database servers, or your own custom tools to `opencode.jsonc`.
- **Per-project overrides.** Drop an `opencode.jsonc` in any repo root to override the user-level config — different default model, different MCP servers, different agent rules. The project file wins for anything it defines.
- **Wire up speech-to-text.** Kronk's Bucky subsystem runs whisper.cpp models from the same server for dictating prompts. See Chapter 18 of the [Kronk manual](https://github.com/ardanlabs/kronk/blob/main/.manual/).
- **Embed it in your own apps.** The Kronk Go SDK is the same code the model server is built on. Load models, run inference, and manage caching directly from your Go programs — no server required.

Microsoft pulled the rug. You don't have to stand on it.
