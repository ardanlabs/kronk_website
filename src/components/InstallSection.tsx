import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const CodeBlock = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = children
      .split("\n")
      .map((line) => line.replace(/^\$\s?/, "").trim())
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block glow-primary overflow-hidden">
      <div className="code-header flex items-center justify-between">
        <span>Terminal</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-[13px] leading-relaxed font-mono">
          <code className="text-foreground">
            {children.split("\n").map((line, i) => (
              <div key={i}>
                <span className="text-primary">$</span> {line.replace(/^\$\s?/, "").trim() || " "}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const InstallSection = () => {
  return (
    <section id="install" className="pt-12 pb-24 scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Install <span className="text-gradient-primary">Kronk</span>
          </h2>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            To install the Kronk tool run the following command:
          </p>

          <div className="mb-8">
            <CodeBlock>go install github.com/ardanlabs/kronk/cmd/kronk@latest</CodeBlock>
          </div>

          <div className="mb-8">
            <CodeBlock>kronk --help</CodeBlock>
          </div>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            To see all the documentation, clone the project and run the Kronk Model Server:
          </p>

          <div className="mb-8">
            <CodeBlock>{`make kronk-server
make website`}</CodeBlock>
          </div>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            You can also install Kronk, run the Kronk Model Server, and open the browser to localhost:8080
          </p>

          <div className="mb-8">
            <CodeBlock>{`go install github.com/ardanlabs/kronk/cmd/kronk@latest
kronk server start`}</CodeBlock>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Read the{" "}
            <Link to="/manual" className="text-primary underline hover:no-underline">
              Manual
            </Link>{" "}
            to learn more about running the Kronk Model Server.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
