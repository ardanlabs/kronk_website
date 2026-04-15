---
title: "Understanding the Kronk Template Systems"
date: "2026-04-15"
slug: "understanding-the-kronk-template-systems"
excerpt: "In this post, we are going to discuss what these Jinja templates are and how Kronk uses them to interact with your model of choice."
author: "bill-kennedy"
banner: "/blog/images/post5_banner.jpg"
ogImage: "/blog/images/post5_twitter.jpg"
---

## Introduction

Every GGUF based LLM ships with a chat template written in a language called [Jinja](https://jinja.palletsprojects.com/en/stable/). The purpose of a chat template is to wrap your input messages in the exact token sequences the model was trained on. Get the template wrong and the model sees gibberish. Get it right and your `system`, `user`, and `assistant` messages turn into the precise format the model expects.

Since Jinja was designed for Python programs, Go developers have 2 choices. We can convert Jinja templates to Go templates which is what Ollama has done or build a module that can execute the Jinja templates in Go. That's what we did and we have released a new Go module called [Jinja](https://github.com/ardanlabs/jinja) that can execute these Jinja templates that are provided in the GGUF metadata.

The Jinja module is a purpose-built Jinja template engine for Go. It has zero dependencies, compiles templates once for safe concurrent reuse, and natively supports all the Jinja constructs that LLM chat templates rely on — including `dict.items()`, `namespace()`, `tojson`, `raise_exception`, and loop controls. This means Kronk can execute the exact same Jinja templates that ship inside GGUF files without needing any workarounds or compatibility shims.

In this post, I’m going to discuss in more detail what these Jinja templates are and how Kronk uses them to interact with your model of choice.

## What Chat Templates Do

A chat template converts a structured conversation (an array of role/content message pairs) into a formatted string that gets fed to the model. Different model families use radically different formats.

A Qwen-family model uses ChatML-style markers:

```
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
Hello!<|im_end|>
<|im_start|>assistant
```

Gemma 4 uses a turn-based format with dedicated tool and thinking tokens:

```
<bos><|turn>system
<|think|>You are a helpful assistant.
<|tool>declaration:web_search{...}<tool|>
<turn|>
<|turn>user
Hello!<turn|>
<|turn>model
```

GLM-4 uses yet another convention with `[gMASK]<sop>` headers and XML-wrapped tool calls.

The job of the template is to format everything such as role markers, tool declaration blocks, thinking/reasoning control, and the generation prompt that signals the model to start producing output.

## Template Resolution: A Three-Tier Hierarchy

The new Jinja module is very good and we continue to make sure it can execute the GGUF version of the chat templates. That being said, Kronk uses a priority-based lookup when resolving which template to apply:

```
1. User-specified .jinja file  (cfg.JinjaFile)
       ↓ not set
2. Catalog template            (cataloger.RetrieveTemplate)
       ↓ not found
3. GGUF metadata fallback      (tokenizer.chat_template)
```

**Tier 1 — Local override.** If the user points to a specific `.jinja` file in their model configuration, Kronk reads it directly and uses it unconditionally. This gives developers complete control over what Jinja template is used.

**Tier 2 — The Kronk catalog.** Kronk maintains a curated catalog of corrected templates in the [kronk_catalogs](https://github.com/ardanlabs/kronk_catalogs) repository. When a model is loaded, the catalog system checks whether it has a known template for that model ID. If so, the catalog version takes precedence over the GGUF metadata.

**Tier 3 — GGUF metadata.** As a final fallback, Kronk extracts the `tokenizer.chat_template` field from the model’s GGUF metadata from the model file.

This hierarchy means users get working templates out of the box, while retaining the ability to override at every level.

### Compile Once, Execute Many

Templates are compiled once per model load and reused across all requests:

```go
type compiledTemplate struct {
   tmpl *jinja.Template
   err  error
}

m.templateOnce.Do(func() {
   tmpl, err := jinja.Compile(m.template.Script)
   m.compiledTmpl = &compiledTemplate{tmpl: tmpl, err: err}
})
```

This avoids repeated parsing overhead on every chat request. The `sync.Once` guard ensures thread safety for concurrent inference.

### Native Dictionary Iteration

Python templates iterate over dictionaries with `for k, v in message.items()` and expect key-value pairs. The Jinja module handles this natively — `dict.items()` is a built-in method on the `Dict` type that returns ordered key-value pairs without any workarounds:

```go
case "items":
   return NewCallable("dict.items", func(args []Value, kwargs map[string]Value) (Value, error) {
       items := make([]Value, 0, d.Len())
       for _, key := range d.Keys {
           pair := NewList([]Value{NewString(key), d.Data[key]})
           items = append(items, pair)
       }
       return NewList(items), nil
   }), nil
```

The Jinja module uses its own `Value` type system throughout, so there are no conversion issues between internal wrapper types and plain Go types. Everything stays in the `Value` domain until final rendering.

### Custom Filters

The Jinja module includes several built-in filters that Python templates take for granted:

- **`tojson`** — Marshals any value to a JSON string using the Jinja module's `valueToGo` conversion to produce clean JSON output.
- **`fromjson`** — Parses a JSON string back into a Go value, enabling templates like GLM-4's that parse stringified tool arguments mid-template.
- **`items`** — Also registered as a filter (not just a method) for templates that use the `| items` pipe syntax.

### Global Functions

The Jinja module’s execution environment includes several built-in global functions:

- **`namespace()`** — Creates a mutable namespace object for cross-loop state tracking. Assignments like `{% set ns.found_first = true %}` work correctly out of the box.
- **`strftime_now()`** — Returns the current date, used by models that incorporate temporal context in their system prompts.
- **`raise_exception()`** — Allows templates to signal errors during formatting, which surfaces as a clean error in Kronk's request pipeline.

### Parameter Normalization

Two parameters control critical template behavior and need special handling:

**`add_generation_prompt`** defaults to `true` and tells the template to append the assistant role header at the end. When building cached prefixes for Kronk's Incremental Message Cache (IMC), this is set to `false` so the cached tokens form a valid prefix that can be extended.

**`enable_thinking`** controls whether reasoning/thinking blocks are emitted. Templates like Gemma 4's check `{% if enable_thinking is defined and enable_thinking %}` to decide whether to inject `<|think|>` tokens. This value may arrive as the string `"true"` from CLI input or catalog config, so Kronk normalizes it to a real boolean:

```go
if v, ok := d["enable_thinking"]; ok {
   switch val := v.(type) {
   case string:
       d["enable_thinking"] = val == "true"
   }
}
```

### Filesystem Isolation

The Jinja module does not support `{% include %}` or `{% extends %}` directives, so templates cannot access the host filesystem. This is a security advantage — there is no need to register a custom filesystem loader to block access because the capability simply does not exist in the engine.

### Automatic Sync

The catalog system automatically synchronizes templates from GitHub. It tracks SHA hashes for each template file and only downloads changes.

Templates are stored locally at `~/.kronk/templates/` and are available immediately on the next model load. The sync is resilient — if the network is unavailable or GitHub rate-limits the request, Kronk falls back to the local cache without error.

## Template Integration Points

Templates don't just format chat messages. They participate in several key subsystems:

**Tokenization API.** The `/v1/tokenize` endpoint supports an `apply_template` flag. When set, the input text is wrapped as a user message and runs through the model's template before counting tokens. This gives callers an accurate count that includes all template overhead — role markers, separators, and the generation prompt.

**Message caching.** Both the System Prompt Cache (SPC) and Incremental Message Cache (IMC) use template output to build cached token sequences. The template is applied with `add_generation_prompt=false` to produce a valid prefix, then the generation prompt is added only for the final request suffix.

**Media models.** For vision and audio models, `applyRequestJinjaTemplate` extracts binary media content from messages before template application, replacing it with marker strings. The template processes the text structure normally, and the media bytes are handled separately by the multimodal pipeline.

## Conclusion

Chat templates are the contract between your application and the model. A misformatted prompt doesn't produce an error, it produces subtly wrong output. The model might ignore your system prompt, fail to recognize tool calls, or generate malformed reasoning blocks.

By investing in a robust Jinja processing layer, a curated catalog of corrected templates, and a three-tier resolution hierarchy, Kronk ensures that the conversation reaching the model is exactly what the model expects, regardless of whether you're running Gemma, Qwen, GLM, or any other architecture.

When trying models that are not yet in the Kronk catalog, the Jinja template embedded in the model’s GGUF metadata is used directly. Thanks to the Jinja module’s comprehensive support for Jinja constructs, most GGUF templates work without modification. For the occasional template that needs adjustment, the Kronk team uses Sourcegraph’s AMP to refine these templates and add them to the catalog for everyone’s benefit.
