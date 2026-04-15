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

Since Jinja was designed for Python programs, Go developers have 2 choices. We can convert Jinja templates to Go templates which is what Ollama has done or build a module that can execute the Jinja templates in Go. Luckily, Nikola Lohinski is maintaining a Go module called [Gonja](https://github.com/nikolalohinski/gonja) that can execute these Jinja templates.

That’s the good news, but there is bad news. Most of these Python based Jinja templates that are provided with the model need some tweaking to run properly with Gonja. I find it’s mostly the syntax around handling tool calling. Because of this, the Kronk project has a [Catalog](https://github.com/ardanlabs/kronk_catalogs) repo with a bunch of updated templates to use with Kronk.

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

The job of the template is to format everything such as role markers, tool declaration blocks, thinking/reasoning control, and the generation prompt that signals the model to start producing output.hulu

## The GGUF Problem: Python Templates in a Go World

Every GGUF model file carries a `tokenizer.chat_template` metadata field containing the Jinja chat template source code. The intention is plug-and-play: load the model, extract the template, and format your messages. In practice, these templates were authored and tested exclusively against Python's Jinja2 library and the Hugging Face `transformers` tokenizer.

When you try to use Go and Gonja, you can run into several categories of problems:

**Dictionary iteration behavior.** Python's `dict.items()` returns key-value tuples that unpack naturally in `for k, v in d.items()`. Go map iteration doesn't produce the same structure without explicit handling.

**Type coercion differences.** Python Jinja is lenient about truthy/falsy values. A string `"true"` behaves differently in Go-based Jinja evaluation than it does in Python, breaking `{% if enable_thinking %}` guards.

**Namespace scoping.** Many templates use `{% set ns = namespace(found_first=false) %}` to track state across loop iterations. This Jinja extension must be explicitly supported in any non-Python implementation.

**Filter availability.** Templates freely use filters like `tojson`, `fromjson`, and `dictsort` that exist in Python's Jinja2 ecosystem but aren't guaranteed in alternative implementations.

These aren't edge cases. They appear in the templates of mainstream models (Gemma, Qwen, GLM, Mistral) that Kronk users run every day.

## Template Resolution: A Three-Tier Hierarchy

Rather than blindly trusting the embedded Jinja template in the GGUF metadata, Kronk uses a priority-based lookup when resolving which template to apply:

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

## Processing Templates with Gonja

As we stated in the introduction, Kronk executes Jinja templates using [Gonja](https://github.com/nikolalohinski/gonja), a Go-native Jinja engine. However, the default Gonja environment doesn't match the Python Jinja behavior perfectly, but luckily Gonja allows you to customize the engine and this is what Kronk has done.

### Compile Once, Execute Many

Templates are compiled once per model load and reused across all requests:

```go
type compiledTemplate struct {
   tmpl *exec.Template
   err  error
}

m.templateOnce.Do(func() {
   tmpl, err := newTemplateWithFixedItems(m.template.Script)
   m.compiledTmpl = &compiledTemplate{tmpl: tmpl, err: err}
})
```

This avoids repeated parsing overhead on every chat request. The `sync.Once` guard ensures thread safety for concurrent inference.

### Fixing Dictionary Iteration

The single most common compatibility issue is `dict.items()`. Python templates iterate over dictionaries with `for k, v in message.items()` and expect key-value pairs. Kronk registers a custom `items` method on the Dict type that returns `[][]any` pairs:

```go
"items": func(self map[string]any, selfValue *exec.Value, arguments *exec.VarArgs) (any, error) {
   items := make([][]any, 0, len(self))
   for key, value := range self {
       v := exec.AsValue(value).ToGoSimpleType(true)
       items = append(items, []any{key, v})
   }
   return items, nil
},
```

The `ToGoSimpleType(true)` call is critical — it converts Gonja's internal `*exec.Value` wrappers back to plain Go types, preventing reflection errors on unexported fields when the template later serializes or inspects these values.

### Custom Filters

Kronk registers several filters that Python templates take for granted:

- **`tojson`** — Marshals any value to a JSON string. Handles lists specially to avoid reflection issues with Gonja's internal types.
- **`fromjson`** — Parses a JSON string back into a Go value, enabling templates like GLM-4's that parse stringified tool arguments mid-template.
- **`items`** — Also registered as a filter (not just a method) for templates that use the `| items` pipe syntax.

### Global Functions

The execution environment injects several functions into the Jinja namespace:

- **`namespace()`** — Creates a mutable namespace object for cross-loop state tracking. Kronk's implementation unwraps `*exec.Value` to plain Go values so that assignments like `{% set ns.found_first = true %}` work correctly.
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

Templates should never access the host filesystem. Kronk registers a `noFSLoader` that rejects all read, resolve, and inherit operations:

```go
type noFSLoader struct{}

func (nl *noFSLoader) Read(path string) (io.Reader, error) {
   return nil, errors.New("filesystem access disabled")
}
```

This prevents any `{% include %}` or `{% extends %}` directives in untrusted templates from reaching the disk.

## The Catalog: Corrected Templates at Scale

Unfortunately the Jinja templates that are provided in the GGUF metadata frequently need corrections to work reliably outside Python. Whitespace handling differs, filter behavior varies, and some templates use Python-specific idioms that have no direct Gonja equivalent.

Kronk addresses this through the [kronk_catalogs](https://github.com/ardanlabs/kronk_catalogs) repository, which maintains a growing collection of corrected `.jinja` template files:

```
templates/
├── gemma-3.jinja
├── gemma-4.jinja
├── glm-4.jinja
├── gpt-oss.jinja
├── lfm2.5-vl.jinja
├── ministral.jinja
├── nanbei.jinja
├── qwen3-coder.jinja
├── qwen3-next.jinja
├── qwen3.5.jinja
└── rnj-1.jinja
```

Each template in this repository has been tested against Kronk's Gonja environment and tuned for correct output. When a new model family is released, the Kronk team tests the embedding template and makes corrections.

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

When trying models that are not associated with the Kronk catalog, expect problems with using the Jinja template embedded in the model’s GGUF metadata. The Kronk team uses Sourcegraph’s AMP to fix these Jinja templates for use in Kronk. You might need to do the same when trying out new models Kronk doesn’t have native support for.
