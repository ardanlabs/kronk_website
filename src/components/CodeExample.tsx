import { motion } from "framer-motion";

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

export const CodeExample = () => {
  return (
    <section id="examples" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Sample API Program - <span className="text-gradient-primary">Question Example</span>
          </h2>
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
