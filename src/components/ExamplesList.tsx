import { motion } from "framer-motion";
import { assetPath } from "@/lib/utils";
import { MessageSquare, Image, Mic, Hash, Search, ArrowUpRight, FileJson, Reply } from "lucide-react";

const code = `package main

import (
    "context"
    "fmt"
    "os"
    "time"

    "github.com/ardanlabs/kronk/sdk/kronk"
    "github.com/ardanlabs/kronk/sdk/kronk/model"
    "github.com/ardanlabs/kronk/sdk/tools/defaults"
    "github.com/ardanlabs/kronk/sdk/tools/libs"
    "github.com/ardanlabs/kronk/sdk/tools/models"
)

const modelURL = "https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/Qwen3-8B-Q8_0.gguf"

func main() {
    // Download libraries and model
    l, _ := libs.New(libs.WithVersion(defaults.LibVersion("")))
    l.Download(context.Background(), kronk.FmtLogger)

    mdls, _ := models.New()
    mp, _ := mdls.Download(context.Background(), kronk.FmtLogger, modelURL, "")

    // Initialize Kronk
    kronk.Init()
    krn, _ := kronk.New(model.Config{ModelFiles: mp.ModelFiles})
    defer krn.Unload(context.Background())

    // Ask a question
    d := model.D{
        "messages": model.DocumentArray(
            model.TextMessage(model.RoleUser, "What is Go?"),
        ),
        "max_tokens": 512,
    }

    ch, _ := krn.ChatStreaming(context.Background(), d)
    for resp := range ch {
        if len(resp.Choice) > 0 {
            fmt.Print(resp.Choice[0].Delta.Content)
        }
    }
}`;

const examples = [
  { icon: Mic, name: "Audio", desc: "Prompt against an audio model", cmd: "make example-audio" },
  { icon: MessageSquare, name: "Chat", desc: "Interactive chat with chat-completion API", cmd: "make example-chat" },
  { icon: Search, name: "Embedding", desc: "Perform embedding operations", cmd: "make example-embedding" },
  { icon: FileJson, name: "Grammar", desc: "Constrain output with GBNF grammars", cmd: "make example-grammar" },
  { icon: Hash, name: "Question", desc: "Ask a simple question with streaming", cmd: "make example-question" },
  { icon: ArrowUpRight, name: "Rerank", desc: "Use a rerank model", cmd: "make example-rerank" },
  { icon: Reply, name: "Response", desc: "Chat with the response API", cmd: "make example-response" },
  { icon: Image, name: "Vision", desc: "Prompt against a vision model", cmd: "make example-vision" },
];

export const ExamplesList = () => {
  return (
    <section id="examples" className="py-12 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
        <img
            src={assetPath("images/ready-to-run.png")}
            alt="Kronk"
            className="mx-auto mb-4 w-[275px]"
          />
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready-to-Run <span className="text-gradient-primary">Examples</span>
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
          There are examples in the examples directory:
          </p>
          <div className="italic text-left mx-auto mt-3 flex max-w-xl items-start gap-2 rounded-md border bg-background p-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
            <svg className="h-4 w-4 mt-0.5 shrink-0 text-blue-400 dark:text-blue-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span>
              <strong>Note:</strong> The first time you run these programs, the system will automatically download and install the required model and libraries.
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2"
        >
          {examples.map((ex) => (
            <a
              key={ex.name}
              href={`https://github.com/ardanlabs/kronk/tree/main/examples/${ex.name.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:border-primary/30"
            >
              <ex.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{ex.name}</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="text-xs text-muted-foreground">{ex.desc}</p>
                <code className="mt-1 block font-mono text-xs text-primary/70">{ex.cmd}</code>
              </div>
            </a>
          ))}
        </motion.div>

        <div className="mt-20 mb-16 text-center">
          <h3 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Sample API Program - <span className="text-gradient-primary">Question Example</span>
          </h3>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="code-block glow-primary overflow-hidden">
            <div className="code-header">question/main.go</div>
            <div className="overflow-x-auto p-4">
              <pre className="text-[13px] leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
