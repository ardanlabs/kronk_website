import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, BookOpen } from "lucide-react";
import { KronkBanner } from "@/components/KronkBanner";
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
    <section className="relative flex min-h-[85vh] items-center justify-center pt-16">
      {/* Animated blurred blobs - color cycling effect */}
      <div className="hero-blobs absolute inset-0 scale-50 lg:scale-100 opacity-50">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-blob hero-blob-4" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
          <h1 className="mb-2 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-primary">Kronk</span>
          </h1>
          
          <KronkBanner />
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
