import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PageMeta } from "@/components/PageMeta";
import { assetPath } from "@/lib/utils";

const GO_INSTALL = "go install github.com/ardanlabs/bucky@latest";
const GITHUB_URL = "https://github.com/ardanlabs/bucky";
const DOCS_URL = "https://pkg.go.dev/github.com/ardanlabs/bucky";
const ARDAN_URL = "https://www.ardanlabs.com/";

const features = [
  {
    title: "Go SDK",
    body: "Embed Whisper directly in Go apps with a whisper.h-mirrored API.",
  },
  {
    title: "CLI",
    body: "Install libs, pull models, and transcribe from the terminal.",
  },
  {
    title: "No CGo",
    body: "Pure Go FFI via purego — no C toolchain required to build your app.",
  },
  {
    title: "Hardware accelerated",
    body: "Metal, CUDA, and Vulkan where available.",
  },
  {
    title: "Audio in, text out",
    body: "WAV / MP3 / FLAC decoding included.",
  },
  {
    title: "Streaming",
    body: "Batch files or realtime block-by-block transcription.",
  },
  {
    title: "Timestamps",
    body: "Segment and word-level timing for captions and search.",
  },
  {
    title: "Private by default",
    body: "Runs locally; audio never needs to leave the device.",
  },
];

const steps = [
  {
    n: "01",
    title: "Install Bucky + libs",
    body: "go install Bucky, then pull whisper.cpp libraries for your platform.",
  },
  {
    n: "02",
    title: "Pull a model",
    body: "From tiny for speed to large-v3-turbo for the best trade-off.",
  },
  {
    n: "03",
    title: "Transcribe",
    body: "Call it from the CLI or embed the Go SDK in your app.",
  },
];

function CopyInstallButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(GO_INSTALL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-bucky-gold px-4 py-2.5 text-sm font-semibold text-bucky-ink transition hover:bg-bucky-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bucky-gold ${className}`}
    >
      <span className="font-mono text-[13px]">{copied ? "Copied" : "go install"}</span>
    </button>
  );
}

function GitHubButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center rounded-md border border-bucky-line bg-bucky-panel px-4 py-2.5 text-sm font-medium text-bucky-paper transition hover:border-bucky-gold/50 hover:text-bucky-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bucky-gold ${className}`}
    >
      View on GitHub
    </a>
  );
}

function BuckySubnav() {
  return (
    <header className="sticky top-16 z-40 border-y border-bucky-line/70 bg-bucky-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <nav className="flex min-w-0 items-center gap-4 overflow-x-auto text-xs text-bucky-fog sm:gap-5 sm:text-sm">
          <a href="#features" className="whitespace-nowrap transition hover:text-bucky-paper">
            Features
          </a>
          <a href="#how-it-works" className="whitespace-nowrap transition hover:text-bucky-paper">
            How it works
          </a>
          <a href="#get-started" className="whitespace-nowrap transition hover:text-bucky-paper">
            Get started
          </a>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap transition hover:text-bucky-paper"
          >
            Docs
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap transition hover:text-bucky-paper"
          >
            GitHub
          </a>
        </nav>

        <CopyInstallButton className="hidden shrink-0 sm:inline-flex !px-3 !py-1.5" />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pb-24"
    >
      <div className="animate-bucky-fade-up text-left">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-bucky-gold">
          Bucky
        </p>
        <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-bucky-paper sm:text-5xl lg:text-[3.4rem]">
          Local speech-to-text for Go
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-bucky-fog sm:text-lg">
          Hardware-accelerated Whisper.cpp bindings with pure-Go audio decoding.
          No CGo. No cloud. Your audio stays yours.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CopyInstallButton />
          <GitHubButton />
        </div>
        <p className="mt-4 font-mono text-xs text-bucky-fog/80">{GO_INSTALL}</p>
      </div>

      <div className="animate-bucky-terminal-in relative pt-14">
        <img
          src={assetPath("images/bucky.png")}
          alt="Bucky"
          className="absolute right-0 -top-[74px] z-10 w-[155px]"
        />
        <div className="overflow-hidden rounded-xl border border-bucky-line bg-bucky-panel shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 border-b border-bucky-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-bucky-fog">
              bucky — whisper transcribe
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-bucky-paper/90 sm:text-sm">
            <code>
              {`$ bucky model get tiny
✓ downloaded ggml-tiny.bin

$ bucky whisper transcribe \\
    -m ~/models/ggml-tiny.bin samples/jfk.wav

And so my fellow Americans ask not what
your country can do for you…`}
              <span className="animate-bucky-caret ml-0.5 inline-block text-bucky-gold">
                ▍
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function CodeProof() {
  return (
    <section id="get-started" className="border-b border-bucky-line/80 bg-bucky-raised/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-bucky-paper sm:text-3xl">
            See it in action
          </h2>
          <p className="mt-3 text-bucky-fog">
            The smallest useful path: install, pull a model, transcribe.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-bucky-line bg-bucky-panel">
          <div className="border-b border-bucky-line px-4 py-3 font-mono text-xs text-bucky-fog">
            terminal
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-bucky-paper/90 sm:p-6 sm:text-sm">
            <code>{`go install github.com/ardanlabs/bucky@latest
bucky install -lib ./lib
bucky model get tiny
bucky whisper transcribe -m ~/models/ggml-tiny.bin samples/jfk.wav`}</code>
          </pre>
        </div>

        <p className="mt-4 border-l-2 border-bucky-gold/60 pl-4 text-sm italic text-bucky-fog">
          And so my fellow Americans ask not what your country can do for you ask
          what you can do for your country.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-bucky-paper sm:text-3xl">
          Everything you need for local STT
        </h2>
        <p className="mt-3 text-bucky-fog">
          Turn WAV, MP3, or FLAC into text from a Go program or the Bucky CLI —
          with timestamps, translation, streaming, and GPU acceleration.
        </p>
      </div>

      <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <li key={feature.title} className="border-t border-bucky-line pt-4">
            <h3 className="text-base font-semibold text-bucky-paper">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-bucky-fog">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-bucky-line/80 bg-bucky-raised/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-bucky-paper sm:text-3xl">
          How it works
        </h2>
        <p className="mt-3 max-w-xl text-bucky-fog">
          Three steps from zero to a local transcript.
        </p>

        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="font-mono text-sm text-bucky-gold">{step.n}</p>
              <h3 className="mt-2 text-lg font-semibold text-bucky-paper">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bucky-fog">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function KronkSection() {
  return (
    <section id="kronk" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-bucky-paper sm:text-3xl">
          Built for Go apps. Powering Kronk.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-bucky-fog">
          Bucky is the speech-to-text sibling of{" "}
          <a
            href="https://github.com/hybridgroup/yzma"
            target="_blank"
            rel="noreferrer"
            className="text-bucky-gold-bright underline decoration-bucky-gold/40 underline-offset-4 transition hover:decoration-bucky-gold"
          >
            yzma
          </a>{" "}
          and the STT backend behind Kronk’s OpenAI-compatible{" "}
          <code className="font-mono text-sm text-bucky-paper">
            POST /v1/audio/transcriptions
          </code>
          . Use Bucky alone as a library, or through Kronk as a full local AI stack.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex text-sm font-medium text-bucky-gold transition hover:text-bucky-gold-bright"
        >
          Visit Kronk →
        </Link>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-y border-bucky-line/80 bg-gradient-to-b from-bucky-forest-dim/30 to-transparent">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <img
          src={assetPath("images/bucky-footer.png")}
          alt=""
          className="mx-auto w-64 -mb-8"
        />
        <h2 className="text-3xl font-semibold tracking-tight text-bucky-paper sm:text-4xl">
          Start transcribing locally.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-bucky-fog">
          Install Bucky, pull a model, and ship speech-to-text in your Go app —
          on your machine.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CopyInstallButton />
          <GitHubButton />
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-bucky-fog transition hover:text-bucky-paper"
          >
            Docs
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-bucky-fog transition hover:text-bucky-paper"
          >
            Kronk
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-bucky-paper">Bucky</p>
            <p className="text-xs text-bucky-fog">Apache-2.0 · Ardan Labs</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-bucky-fog">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-bucky-paper">
            GitHub
          </a>
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="hover:text-bucky-paper">
            Docs
          </a>
          <Link to="/" className="hover:text-bucky-paper">
            Kronk
          </Link>
          <a href={ARDAN_URL} target="_blank" rel="noreferrer" className="hover:text-bucky-paper">
            Ardan Labs
          </a>
          <a href="mailto:hello@ardanlabs.com" className="hover:text-bucky-paper">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

const Bucky = () => {
  return (
    <div className="min-h-svh bg-background">
      <PageMeta
        title="Bucky — Local speech-to-text for Go"
        description="Bucky — local speech-to-text for Go. Hardware-accelerated Whisper.cpp bindings. No CGo. No cloud."
        path="/bucky"
        ogImage="/images/bucky-logo.png"
        ogImageAlt="Bucky — Local speech-to-text for Go"
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Navbar />
      <div className="bucky-page min-h-[calc(100svh-4rem)] pt-16">
        <main>
          <Hero />
          <BuckySubnav />
          <CodeProof />
          <Features />
          <HowItWorks />
          <KronkSection />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Bucky;
