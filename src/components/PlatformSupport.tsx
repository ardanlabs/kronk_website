import { motion } from "framer-motion";
import { Monitor, Apple, Laptop } from "lucide-react";

const platforms = [
  {
    icon: Laptop,
    os: "Linux",
    cpu: "amd64, arm64",
    gpu: "CUDA, Vulkan, HIP, ROCm, SYCL",
  },
  {
    icon: Apple,
    os: "macOS",
    cpu: "arm64",
    gpu: "Metal",
  },
  {
    icon: Monitor,
    os: "Windows",
    cpu: "amd64",
    gpu: "CUDA, Vulkan, HIP, SYCL, OpenCL",
  },
];

export const PlatformSupport = () => {
  return (
    <section id="platform" className="border-y border-border bg-card py-24 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Platform <span className="text-gradient-primary">Support</span>
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Kronk supports over 94% of llama.cpp functionality. Automatic testing against every new llama.cpp release.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3"
        >
          {platforms.map((p) => (
            <div
              key={p.os}
              className="rounded-xl border border-border bg-background p-6 text-center"
            >
              <p.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-3 text-lg font-semibold">{p.os}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-mono text-xs text-secondary-foreground">CPU</span>{" "}
                  {p.cpu}
                </p>
                <p>
                  <span className="font-mono text-xs text-secondary-foreground">GPU</span>{" "}
                  {p.gpu}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
