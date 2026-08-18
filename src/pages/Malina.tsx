import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PageMeta } from "@/components/PageMeta";
import { assetPath } from "@/lib/utils";

const GO_INSTALL = "go install github.com/ardanlabs/malina@latest";
const GITHUB_URL = "https://github.com/ardanlabs/malina";
const DOCS_URL = "https://pkg.go.dev/github.com/ardanlabs/malina";
const ARDAN_URL = "https://www.ardanlabs.com/";

const features = [
  {
    title: "Go SDK",
    body: "Embed Stable Diffusion directly in Go apps with a stable-diffusion.h-mirrored API.",
  },
  {
    title: "CLI",
    body: "Install libs, pull models, and generate images from the terminal.",
  },
  {
    title: "No CGo",
    body: "Pure Go FFI via purego — no C toolchain required to build your app.",
  },
  {
    title: "Hardware accelerated",
    body: "Metal and CUDA where available.",
  },
  {
    title: "Prompt in, image out",
    body: "PNG and JPEG I/O included, plus img2img from a source frame.",
  },
  {
    title: "Video",
    body: "Mux PNG / JPEG frames into a Motion-JPEG AVI — no extra tools.",
  },
  {
    title: "Model catalog",
    body: "Pull SD 1.5, SDXL, or FLUX.2 bundles instead of pasting URLs.",
  },
  {
    title: "Private by default",
    body: "Runs locally; prompts and images never need to leave the device.",
  },
];

const steps = [
  {
    n: "01",
    title: "Install Malina + libs",
    body: "go install Malina, then pull stable-diffusion.cpp libraries for your platform.",
  },
  {
    n: "02",
    title: "Pull a model",
    body: "From sd-1.5 for a first image to SDXL or FLUX.2 for higher fidelity.",
  },
  {
    n: "03",
    title: "Generate",
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
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-malina-gold px-4 py-2.5 text-sm font-semibold text-malina-ink transition hover:bg-malina-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-malina-gold ${className}`}
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
      className={`inline-flex items-center justify-center rounded-md border border-malina-line bg-malina-panel px-4 py-2.5 text-sm font-medium text-malina-paper transition hover:border-malina-gold/50 hover:text-malina-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-malina-gold ${className}`}
    >
      View on GitHub
    </a>
  );
}

function MalinaSubnav() {
  return (
    <header className="sticky top-16 z-40 border-y border-malina-line/70 bg-malina-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <nav className="flex min-w-0 items-center gap-4 overflow-x-auto text-xs text-malina-fog sm:gap-5 sm:text-sm">
          <a href="#features" className="whitespace-nowrap transition hover:text-malina-paper">
            Features
          </a>
          <a href="#how-it-works" className="whitespace-nowrap transition hover:text-malina-paper">
            How it works
          </a>
          <a href="#get-started" className="whitespace-nowrap transition hover:text-malina-paper">
            Get started
          </a>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap transition hover:text-malina-paper"
          >
            Docs
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap transition hover:text-malina-paper"
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
      <div className="animate-bucky-fade-up text-left pb-6 lg:pb-0">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-malina-gold">
          Malina
        </p>
        <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-malina-paper sm:text-5xl lg:text-[3.4rem]">
          Local image generation for Go
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-malina-fog sm:text-lg">
          Hardware-accelerated stable-diffusion.cpp bindings with pure-Go PNG and JPEG I/O.
          No CGo. No cloud. Your prompts stay yours.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CopyInstallButton />
          <GitHubButton />
        </div>
        <p className="mt-4 font-mono text-xs text-malina-fog/80">{GO_INSTALL}</p>
      </div>

      <div className="animate-bucky-terminal-in relative pt-14">
        <img
          src={assetPath("images/malina.gif")}
          alt="Malina"
          className="absolute -right-2 lg:right-0 -top-[75px] z-10 w-[170px]"
        />
        <div className="overflow-hidden rounded-xl border border-malina-line bg-malina-panel shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 border-b border-malina-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-malina-fog">
              malina — generate image
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-malina-paper/90 sm:text-sm">
            <code>
              {`$ malina model pull sd-1.5
✓ downloaded v1-5-pruned-emaonly.safetensors

$ go run ./examples/hello "a lovely cat"

wrote hello.png (512x512) in 6.8s`}
              <span className="animate-bucky-caret ml-0.5 inline-block text-malina-gold">
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
    <section id="get-started" className="border-b border-malina-line/80 bg-malina-raised/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-malina-paper sm:text-3xl">
            See it in action
          </h2>
          <p className="mt-3 text-malina-fog">
            The smallest useful path: install, pull a model, generate.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-malina-line bg-malina-panel">
          <div className="border-b border-malina-line px-4 py-3 font-mono text-xs text-malina-fog">
            terminal
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-malina-paper/90 sm:p-6 sm:text-sm">
            <code>{`go install github.com/ardanlabs/malina@latest
malina install -lib ./lib
export MALINA_LIB=$(pwd)/lib
malina model pull sd-1.5
go run ./examples/hello "a lovely cat"`}</code>
          </pre>
        </div>

        <p className="mt-4 border-l-2 border-malina-gold/60 pl-4 text-sm italic text-malina-fog">
          Malina is the Russian word for “raspberry” — a small, dense, fast-growing fruit.
          Naming a stable-diffusion binding after a fast little thing that sprouts colorful
          pictures is just good taste.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-malina-paper sm:text-3xl">
          Everything you need for local image gen
        </h2>
        <p className="mt-3 text-malina-fog">
          Turn a prompt into a PNG from a Go program or the Malina CLI — with img2img,
          video muxing, and GPU acceleration.
        </p>
      </div>

      <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <li key={feature.title} className="border-t border-malina-line pt-4">
            <h3 className="text-base font-semibold text-malina-paper">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-malina-fog">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-malina-line/80 bg-malina-raised/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-malina-paper sm:text-3xl">
          How it works
        </h2>
        <p className="mt-3 max-w-xl text-malina-fog">
          Three steps from zero to a local image.
        </p>

        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="font-mono text-sm text-malina-gold">{step.n}</p>
              <h3 className="mt-2 text-lg font-semibold text-malina-paper">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-malina-fog">{step.body}</p>
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
        <h2 className="text-2xl font-semibold tracking-tight text-malina-paper sm:text-3xl">
          Built for Go apps. Powering Kronk.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-malina-fog">
          Malina is the image-generation sibling of{" "}
          <Link
            to="/bucky"
            className="text-malina-gold-bright underline decoration-malina-gold/40 underline-offset-4 transition hover:decoration-malina-gold"
          >
            Bucky
          </Link>{" "}
          and{" "}
          <a
            href="https://github.com/hybridgroup/yzma"
            target="_blank"
            rel="noreferrer"
            className="text-malina-gold-bright underline decoration-malina-gold/40 underline-offset-4 transition hover:decoration-malina-gold"
          >
            yzma
          </a>
          , and the path to Kronk’s OpenAI-compatible{" "}
          <code className="font-mono text-sm text-malina-paper">
            POST /v1/images/generations
          </code>
          . Use Malina alone as a library, or through Kronk as a full local AI stack.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex text-sm font-medium text-malina-gold transition hover:text-malina-gold-bright"
        >
          Visit Kronk →
        </Link>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-y border-malina-line/80 bg-gradient-to-b from-malina-red-dim/30 to-transparent">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <img
          src={assetPath("images/malina-footer.png")}
          alt=""
          className="mx-auto mb-4 w-full max-w-80"
        />
        <h2 className="text-3xl font-semibold tracking-tight text-malina-paper sm:text-4xl">
          Start generating locally.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-malina-fog">
          Install Malina, pull a model, and ship image generation in your Go app —
          on your machine.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CopyInstallButton />
          <GitHubButton />
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-malina-fog transition hover:text-malina-paper"
          >
            Docs
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-malina-fog transition hover:text-malina-paper"
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
            <p className="text-sm font-semibold text-malina-paper">Malina</p>
            <p className="text-xs text-malina-fog">Apache-2.0 · Ardan Labs</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-malina-fog">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-malina-paper">
            GitHub
          </a>
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="hover:text-malina-paper">
            Docs
          </a>
          <Link to="/" className="hover:text-malina-paper">
            Kronk
          </Link>
          <Link to="/bucky" className="hover:text-malina-paper">
            Bucky
          </Link>
          <a href={ARDAN_URL} target="_blank" rel="noreferrer" className="hover:text-malina-paper">
            Ardan Labs
          </a>
          <a href="mailto:hello@ardanlabs.com" className="hover:text-malina-paper">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

const Malina = () => {
  return (
    <div className="min-h-svh bg-background">
      <PageMeta
        title="Malina — Local image generation for Go"
        description="Malina — local image generation for Go. Hardware-accelerated stable-diffusion.cpp bindings. No CGo. No cloud."
        path="/malina"
        ogImage="/images/malina.png"
        ogImageAlt="Malina — Local image generation for Go"
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
      <div className="malina-page min-h-[calc(100svh-4rem)] pt-16">
        <main>
          <Hero />
          <MalinaSubnav />
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

export default Malina;
