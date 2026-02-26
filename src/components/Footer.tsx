import { Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-bold text-primary">kronk</span>
          <span className="text-sm text-muted-foreground">
            © 2025 Ardan Labs. Apache-2.0 License.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://pkg.go.dev/github.com/ardanlabs/kronk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Go Docs
          </a>
          <a
            href="https://github.com/ardanlabs/kronk/blob/main/MANUAL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Manual
          </a>
          <a
            href="https://github.com/ardanlabs/kronk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
