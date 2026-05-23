---
title: "Bucky: Bringing Whisper to Kronk"
date: "2026-05-23"
slug: "bucky-bringing-whisper-to-kronk"
excerpt: "Kronk now ships with Bucky — a peer backend that puts whisper.cpp behind the same SDK, pool, CLI, and BUI surfaces you already use for llama.cpp. In this post we'll walk through how it's wired up and the design decisions that fell out of it."
author: "bill-kennedy"
banner: "/blog/images/post6_banner.jpg"
ogImage: "/blog/images/post6_twitter.jpg"
---

## Introduction

Up until now, Kronk has been a llama.cpp story. Text generation, vision, embeddings, reranking — every endpoint, every CLI verb, every BUI screen has assumed there is one inference engine living behind it. With this release that changes. Kronk now ships with **Bucky**, a peer backend that wraps [whisper.cpp](https://github.com/ggerganov/whisper.cpp) and exposes speech-to-text through the same surfaces you already use for the LLM stack.

If you have been reading the earlier posts, you already know the shapes Kronk likes to work in — a SDK handle that owns a model, a pool that caches handles with TTL eviction, an OpenAI-compatible HTTP surface, and a CLI tree that mirrors all of it. Bucky drops into every one of those slots. There is a `bucky.New(...)` handle, a `sdk/bucky/pool` cache, a `/v1/audio/transcriptions` endpoint, a `kronk bucky ...` sub-command tree, and a Translator app in the Browser UI.

In this post I'm going to walk through how Bucky is wired up and the design decisions that fell out of it.

## Why a Separate Backend?

The first decision we had to make was whether to treat whisper as just another model kind inside the existing llama pipeline, or as its own backend. We chose the latter, and registered it under a new kind in the cross-backend registry called `backend.KindWhisper`. There were three reasons.

First, the runtime libraries are different. whisper.cpp ships its own shared library — `libwhisper` — with its own platform triples (`cpu`, `metal`, `cuda`, `vulkan`) and its own install root at `~/.kronk/bucky-libraries/`. Treating it as a separate backend kept the install / upgrade story clean: `kronk libs` is for llama.cpp, `kronk bucky libs` is for whisper.cpp, and each can be upgraded independently without disturbing the other.

Second, the concurrency model is different. A whisper context is single-stream — one decode at a time per context — so the "batch engine + slot" story we built in [post 3](/blog/concurrent-model-inference-request-processing-in-kronk) does not apply. Whisper's concurrency comes from its own internal `whisper.State` pool, and the semaphore in front of the handle is sized 1:1 with `NSeqMax`, not `NSeqMax * QueueDepth`. Putting that into the llama batch engine would have been a square peg in a round hole.

Third, the model catalog is different. Whisper models are flat single-file `ggml-<name>.bin` blobs from a small bundled list (`tiny` through `large-v3-turbo`). The full Kronk catalog with its provider/family/revision tree and HuggingFace resolution would have been overkill. Bucky has its own small catalog with its own pull / list / remove verbs.

The win from keeping the backends separate is that they remain peers. Kronk runs llama.cpp; Bucky runs whisper.cpp. They share infrastructure where it makes sense — and stay out of each other's way where it doesn't.

## The Two-Gate Concurrency Model

Inside a single Bucky handle there are two concurrency gates in front of every transcribe call.

The **outer gate** is a buffered channel — a classic Go semaphore — sized to `max(NSeqMax, 1)`. This is the same pattern `sdk/kronk` uses for embedding and reranking handles. Because whisper has no batch engine to amortize work across requests, the right capacity is the number of concurrent decodes the model can actually run, which is exactly `NSeqMax`.

The **inner gate** is a pool of `whisper.State` instances, also of size `NSeqMax`. The model weights live once in the shared `whisper.Context`; each pooled `State` owns its own mel spectrogram, decoder KV cache, and compute buffer. So two goroutines holding two different `State`s can decode two different audio clips against the same model in parallel. The state pool is a bare channel of indices — acquire pulls one out, release puts it back. There is no explicit reset because `whisper_full_with_state` resets the state internally on the next call.

Put together, a transcribe looks like this:

```go
func (b *Bucky) Transcribe(ctx context.Context, samples []float32, opts ...model.TranscribeOption) (model.Transcription, error) {
    m, err := b.acquireModel(ctx)   // outer semaphore + shutdown guard
    if err != nil {
        return model.Transcription{}, err
    }
    defer b.releaseModel()

    return m.Transcribe(ctx, samples, opts...)   // inner state-pool + whisper FFI
}
```

The outer gate is what makes shutdown work. `Unload` takes a mutex, sets a shutdown flag, then polls the active stream counter until it reaches zero or the unload context expires. Subsequent acquires fail fast. The inner pool is what makes parallelism work. Together they give you the same "submit-and-wait" feel as the llama batch engine, without needing a batch engine at all.

## One Memory Budget, Two Backends

One of the things that has always been important in Kronk is that VRAM accounting is honest. The pool's `resman.Manager` reserves bytes before a load and releases them on eviction, so the per-GPU budget you set on the command line is the truth.

When we added Bucky we kept that property. The bucky pool is constructed with the **same** `resman.Manager` instance as the llama pool. That single shared manager is what unifies the two backends. A whisper-large-v3 load and a Qwen3 load compete for the same byte budget. When the BUI shows you per-GPU `used / budget / free`, it covers both backends.

That has a nice side effect on the BUI's model status. `Pool.ModelStatus()` reports two kinds of entries — **loaded** ones it pulls from the engine cache, and **loading** ones it pulls from `resman.Usage()` filtered by `engine.HasTicket()`. The filter is what stops the bucky pool from surfacing the llama pool's in-flight reservations and vice versa. So the same status surface gives you a consistent view of both backends.

There is one place the bucky pool actually has a memory advantage over its llama sibling. llama.cpp uses mmap and paged experts, so a model's resman reservation is a best-effort estimate of the live footprint. Bucky loads the whole whisper context into memory at once, so the reservation total is a faithful proxy for what the model is really using. When you read the bucky entries in the model status table, the number you see is the number on the GPU.

## Degraded Mode

One UX problem we had to solve was the first-time-install story. A user pulls Kronk down, starts the server, and discovers that the whisper libraries are not on disk. With the old approach the server would have crashed at startup and the user would have had to install libraries from the command line before they could even open the BUI.

We did not want that. The whole point of the BUI is that you can install everything from a browser tab.

So we made `bucky.Init` **idempotent**. It registers the whisper backend with the cross-backend registry first — before trying to load `libwhisper` — so even if the shared library is missing, the BUI and CLI can still build the libs manager and the catalog manager. Then it tries to load the library. On failure, `initDone` stays `false` and the next call to `Init` retries.

The server takes advantage of that:

```go
if err := bucky.Init(bucky.WithInitLibPath(buckyLibs.LibsPath())); err != nil {
    log.Info(ctx, "startup", "WARNING", "bucky init failed, running in degraded mode (use BUI to download whisper libraries)", "ERROR", err)
}
```

A failed init becomes a warning, not a panic. The server boots, the `/v1/bucky/libs/*` and `/v1/bucky/models/*` admin endpoints are live, the BUI Whisper Libraries screen is reachable, and the user installs the libraries by clicking a button. After the install the server's pool can call `Init` again and the next transcribe request lights up. No restart needed.

`/v1/audio/transcriptions` is the only endpoint that errors while you are in degraded mode. Everything else, including the rest of the LLM stack, runs normally.

## The OpenAI Surface

For HTTP, we did the obvious thing. The transcription endpoint is `POST /v1/audio/transcriptions`, OpenAI-compatible, multipart upload, 25 MB cap (matching OpenAI's documented limit). The form fields are the OpenAI fields — `file`, `model`, `language`, `prompt`, `response_format`, `timestamp_granularities[]`, `translate`. The response formats are the OpenAI formats — `json`, `verbose_json`, `text`, `srt`, `vtt`.

The handler itself is intentionally thin:

1. Parse the multipart form (25 MB cap).
2. Decode the upload to 16 kHz mono float32 PCM using `audio.Decode` from the `bucky/pkg/audio` package.
3. Acquire a model from the bucky pool.
4. Apply the English-only guard — if the model is `.en` and the caller asked for anything other than empty or `en`, reject the request before any decode work happens.
5. Run `Bucky.Transcribe` under a 30-minute per-request timeout.
6. Dispatch the output to the requested response format.

There is no fancy queuing or routing. The pool handles model resolution, the bucky handle handles concurrency, and the FFI handles the actual work. The handler is glue.

For the admin side, there are matching endpoints under `/v1/bucky/libs/*` and `/v1/bucky/models/*` that mirror the llama-side `/v1/libs/*` and `/v1/models/*` endpoints. Same shapes, different backend. The BUI screens and the `kronk bucky` CLI verbs all dispatch through them in their default web mode.

## A Tiny SDK Example

Here is the full SDK side of a transcribe, end to end:

```go
// Make sure the whisper.cpp shared libs and a small model are on disk.
lib, _ := buckylibs.New()
lib.Download(ctx, bucky.FmtLogger)

mdls, _ := buckymodels.New()
mp, _ := mdls.Download(ctx, bucky.FmtLogger, "tiny.en")

// Load the whisper.cpp shared library.
if err := bucky.Init(); err != nil {
    log.Fatal(err)
}

// Construct a handle for one model.
b, _ := bucky.New(
    model.WithModelPath(mp.ModelFiles[0]),
    model.WithUseGPU(true),
)
defer b.Unload(ctx)

// Decode audio to 16 kHz mono float32 PCM and transcribe.
f, _ := os.Open("samples/jfk.wav")
defer f.Close()
samples, _ := audio.Decode(f)

tr, _ := b.Transcribe(ctx, samples, model.WithLanguage("en"))
fmt.Println(tr.Text)
```

That is the same shape as the llama SDK — install libraries, pull a model, initialize the backend, construct a handle, do the work, unload. If you have written a Kronk program before, you already know how to write a Bucky one.

The fully worked example lives at [`examples/bucky/main.go`](https://github.com/ardanlabs/kronk/blob/main/examples/bucky/main.go) and is runnable with `make example-bucky`. The first time you run it the system will download the whisper.cpp libraries and the `tiny.en` model for you.

## The Translator App

On the BUI side, Bucky shows up in three places. The **Whisper Libraries** screen manages `~/.kronk/bucky-libraries/` — list, install, and remove triples. The **Whisper Models** screen manages `~/.kronk/bucky-models/` — browse the bundled catalog, pull, list, remove, view the ggml header. And under **Apps** there is a new tool called the **Translator** — upload or record audio, pick a model, pick a language (or auto-detect), choose a response format, and watch the transcript appear with per-segment timestamps.

The Translator is what most users will see first. It is a thin client over `/v1/audio/transcriptions` and exposes the same fields the endpoint accepts. If you are running Kronk for personal use, it doubles as a perfectly serviceable local replacement for cloud transcription services — your audio never leaves your machine.

## Conclusion

Bucky was an exercise in saying yes to a different runtime without breaking the shape of the project. By making whisper.cpp a peer backend instead of a special-case model, we got to keep every existing surface — SDK, pool, CLI, BUI, HTTP — and we got to share the things that genuinely should be shared, like the resman, while letting each backend keep the things that should not, like its concurrency model and its model catalog.

If you want to try it, install the libraries with `kronk bucky libs`, pull a model with `kronk bucky model pull tiny.en`, and call the endpoint with curl:

```shell
curl -X POST http://localhost:11435/v1/audio/transcriptions \
  -H "Authorization: Bearer $KRONK_TOKEN" \
  -F file=@samples/jfk.wav \
  -F model=tiny.en \
  -F response_format=json
```

For the full reference — install, model catalog, server / pool configuration, CLI, BUI, API, SDK, languages, troubleshooting — see [Chapter 18: Bucky (Audio Transcription)](https://github.com/ardanlabs/kronk/blob/main/.manual/chapter-18-bucky.md) in the manual. The developer-level internals (package layout, the per-handle semaphore, the `whisper.State` pool, the audioapp HTTP handler, tests) live in [Chapter 19 §19.13](https://github.com/ardanlabs/kronk/blob/main/.manual/chapter-19-developer-guide.md).

As always, give it a spin, kick the tires, and let us know what you think.
