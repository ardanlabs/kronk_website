import { motion } from "framer-motion";
import { Cpu, Zap, Server, Globe, Wrench, Brain } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Hardware Accelerated",
    description:
      "Full GPU acceleration via CUDA, Metal, Vulkan, ROCm, HIP, SYCL, and OpenCL. Runs on your hardware with maximum performance.",
  },
  {
    icon: Zap,
    title: "OpenAI-Compatible API",
    description:
      "A high-level API that feels similar to using an OpenAI compatible API. Chat completions, responses, embeddings, and reranking.",
  },
  {
    icon: Server,
    title: "Model Server",
    description:
      "Built-in model server compatible with OpenWebUI, Cline, and Claude Code. Serve models locally with a single command.",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description:
      "Full support for Linux (amd64, arm64), macOS (arm64 Metal), and Windows (amd64) with automatic hardware detection.",
  },
  {
    icon: Brain,
    title: "Multimodal Support",
    description:
      "Use text, vision, and audio models. GGUF format support with access to 147k+ models on Hugging Face.",
  },
  {
    icon: Wrench,
    title: "Tool Calling",
    description:
      "Native function calling support. Let models invoke your Go functions with structured input and output.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Features = () => {
  return (
    <section id="features" className="pb-12 pt-24 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Why <span className="text-gradient-primary">Kronk</span>?
          </h2>
          <p className="mx-auto mb-4 font-bold text-lg leading-relaxed text-foreground sm:text-2xl">
            Everything you need to run LLMs locally in Go with production-grade performance.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 text-left w-full lg:w-[90%] mx-auto">
            <p className="mx-auto text-muted-foreground leading-relaxed">
              This project lets you use Go for hardware accelerated local inference with llama.cpp directly integrated into your applications via the <a href="https://github.com/hybridgroup/yzma" target="_blank" rel="noopener noreferrer" className="text-primary underline">yzma</a> module. Kronk provides a high-level API that feels similar to using an OpenAI compatible API.
            </p>
            <p className="mx-auto text-muted-foreground leading-relaxed">
              This project also provides a model server for chat completions, responses, messages, embeddings, and reranking. The server is compatible with the OpenWebUI, Cline, and Claude Code projects.
            </p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <feature.icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
