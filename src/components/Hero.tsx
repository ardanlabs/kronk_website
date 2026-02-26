import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, BookOpen } from "lucide-react";
import { useState } from "react";

export const Hero = () => {
  const [copied, setCopied] = useState(false);
  const installCmd = "go install github.com/ardanlabs/kronk/cmd/kronk@latest";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
      {/* Subtle pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 670 670' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23ffffff' d='M312.56,65.75v67.31h44.88v-67.31h-44.88ZM160.5,128.77l-31.73,31.73,47.59,47.59,31.73-31.73-47.59-47.59ZM509.5,128.77l-47.59,47.59,31.73,31.73,47.59-47.59-31.73-31.73ZM335,177.94c-86.48,0-157.06,70.59-157.06,157.06s70.59,157.06,157.06,157.06,157.06-70.59,157.06-157.06-70.59-157.06-157.06-157.06ZM335,222.81c62.23,0,112.19,49.96,112.19,112.19s-49.96,112.19-112.19,112.19-112.19-49.96-112.19-112.19,49.96-112.19,112.19-112.19ZM65.75,312.56v44.88h67.31v-44.88h-67.31ZM536.94,312.56v44.88h67.31v-44.88h-67.31ZM176.36,461.91l-47.59,47.59,31.73,31.73,47.59-47.59-31.73-31.73ZM493.64,461.91l-31.73,31.73,47.59,47.59,31.73-31.73-47.59-47.59ZM312.56,536.94v67.31h44.88v-67.31h-44.88Z'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 font-mono text-sm text-primary">by Ardan Labs</p>
          <h1 className="mb-2 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-primary">Kronk</span>
          </h1>
          
          <img
            src="/images/kronk-banner.jpg"
            alt="Kronk"
            className="mx-auto mb-4 max-w-3xl w-full rounded-lg object-cover shadow-lg"
          />
          <p className="mx-auto mb-3 font-bold text-xl leading-relaxed text-foreground sm:text-2xl">
            Your personal engine for running open source models locally. 
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Use Go for hardware accelerated local inference with llama.cpp directly integrated into your Go applications via the yzma module. Kronk provides a high-level API that feels similar to using an OpenAI compatible API.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-xl"
        >
          <div className="code-block glow-primary">
            <div className="code-header flex items-center justify-between">
              <span>Install</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="px-4 py-3">
              <code className="text-sm text-foreground text-left">
                <p><span className="text-primary">$</span> {installCmd}</p>
              </code>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="https://github.com/ardanlabs/kronk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Get Started
          </a>
          <Link
            to="/manual"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            Manual
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
