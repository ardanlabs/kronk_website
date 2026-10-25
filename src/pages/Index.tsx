import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { SdkSection } from "@/components/SdkSection";
import { InstallSection } from "@/components/InstallSection";
import { PlatformSupport } from "@/components/PlatformSupport";
import { ExamplesList } from "@/components/ExamplesList";
import { Footer } from "@/components/Footer";

const homeLinks = [
  { label: "Features", href: "#features" },
  { label: "SDK", href: "#sdk" },
  { label: "Install", href: "#install" },
  { label: "Platform", href: "#platform" },
  { label: "Examples", href: "#examples" },
];

function HomeSubnav() {
  return (
    <header className="sticky top-16 z-40 border-y border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-11 items-center px-6">
        <nav className="flex min-w-0 items-center gap-5 overflow-x-auto text-sm text-muted-foreground sm:gap-8">
          {homeLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Kronk — Hardware Accelerated LLM Inference for Go"
        description="Kronk is a Go library for hardware accelerated local LLM inference with llama.cpp. OpenAI-compatible API."
        path="/"
      />
      <Navbar />
      <Hero />
      <section aria-labelledby="cloud-demo-title" className="container mx-auto px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="cloud-demo-title" className="mb-2 text-2xl font-bold">
              See Kronk in action on Google Cloud Run
            </h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              Explore Ardan Labs AI, a demo site showing how to build apps with
              Kronk that run on Google Cloud Run with NVIDIA GPUs.
            </p>
          </div>
          <a
            href="https://ardanlabs.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try the demo
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
      <HomeSubnav />
      <Features />
      <SdkSection />
      <InstallSection />
      <PlatformSupport />
      <ExamplesList />
      <Footer />
    </div>
  );
};

export default Index;
