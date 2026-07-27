import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Github, Rocket } from "lucide-react";
import { KronkBanner } from "@/components/KronkBanner";
import { assetPath } from "@/lib/utils";

export const Hero = () => {
  return (
    <section className="relative flex items-center justify-center pt-16 pb-12">
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
          
          <h1 className="mb-6 flex items-center justify-center gap-4 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            <a
              href="https://www.ardanlabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
              aria-label="Ardan Labs"
            >
              <img
                src={assetPath("images/ardan-labs-badge.svg")}
                alt="Ardan Labs"
                className="h-16 w-auto sm:h-20 lg:h-24"
              />
            </a>
            <span className="text-gradient-primary">Kronk</span>
          </h1>
          
          <KronkBanner />
          <p className="mx-auto mb-3 font-bold text-xl leading-relaxed text-foreground sm:text-2xl">
            Your personal engine for running open source models locally. 
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Your personal engine for running open source models locally. Use Go for hardware accelerated local inference with llama.cpp and whisper.cpp directly integrated into your Go applications. Kronk provides a high-level API and a model server.
          </p>
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
            to="/showcase"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Rocket className="h-4 w-4" />
            Showcase
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
