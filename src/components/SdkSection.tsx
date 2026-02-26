import { motion } from "framer-motion";

export const SdkSection = () => {
  return (
    <section id="sdk" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient-primary">SDK</span>
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
            The Kronk SDK allows you to write applications that can directly interact with local open source GGUF models (supported by llama.cpp) that provide inference for text and media (vision and audio).
          </p>
          <div className="rounded-xl overflow-hidden border border-border bg-card relative">
            <img
              src="/blog/images/sdk-diagram-light-mode.svg"
              alt="Kronk SDK architecture diagram"
              className="w-3/4 mx-auto h-auto block dark:hidden"
            />
            <img
              src="/blog/images/sdk-diagram-dark-mode.svg"
              alt="Kronk SDK architecture diagram"
              className="w-3/4 mx-auto h-auto hidden dark:block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
