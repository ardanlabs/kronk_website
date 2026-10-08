import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AudioLines, BookOpen, Github, Image, Rocket } from "lucide-react";
import { KronkBanner } from "@/components/KronkBanner";

export const Hero = () => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-16">
      {/* Animated blurred blobs - color cycling effect */}
      <div className="hero-blobs absolute inset-0 scale-50 lg:scale-100 opacity-50">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-blob hero-blob-4" />
      </div>

      <div className="container relative z-10 mx-auto h-[calc(100svh-4rem)] min-h-[36rem] px-6 py-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex h-full flex-col items-center gap-6"
        >
          
          <h1 className="shrink-0 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-primary">Kronk</span>
          </h1>
          <p className="mx-auto shrink-0 font-bold text-lg leading-snug text-foreground sm:text-2xl">
            Everything you need to run LLMs locally in Go with production-grade performance.
          </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex shrink-0 flex-wrap items-center justify-center gap-2 [&>a]:px-3 [&>a]:py-2 sm:gap-3 sm:[&>a]:px-6 sm:[&>a]:py-3"
        >
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Learn More
          </a>
          <a
            href="#install"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Install
          </a>
          <a
            href="https://github.com/ardanlabs/kronk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Github className="h-4 w-4" />
            Project
          </a>
          <Link
            to="/manual"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            Manual
          </Link>
          <Link
            to="/bucky"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <AudioLines className="h-4 w-4" />
            Bucky
          </Link>
          <Link
            to="/malina"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Image className="h-4 w-4" />
            Malina
          </Link>
          <Link
            to="/showcase"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Rocket className="h-4 w-4" />
            Showcase
          </Link>
        </motion.div>
          <KronkBanner />
          <p className="mx-auto shrink-0 font-bold text-xl leading-snug text-foreground sm:text-2xl">
            Go With Your Own Intelligence!
          </p>
          <p className="mx-auto max-w-3xl shrink-0 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Use Go for hardware accelerated local inference with llama.cpp, whisper.cpp, and stable-diffusion.cpp directly integrated into your Go applications. Kronk provides a high-level API and production ready model server.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
