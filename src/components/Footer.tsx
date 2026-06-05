import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { assetPath } from "@/lib/utils";

export const Footer = ({ showBadge = true }: { showBadge?: boolean }) => {
  return (
    <footer className="border-t border-border py-12">
      {showBadge && (
      <div className="container mx-auto mb-8 px-6">
        <div className="max-w-3xl mx-auto">
        <a
          href="https://www.ardanlabs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-colors"
        >
          <img
            src={assetPath("images/ardan-labs-badge.svg")}
            alt="Ardan Labs"
            className="h-28 w-auto shrink-0"
          />
          <div>
            <p className="font-medium text-foreground mb-0.5">
              Kronk is built by Ardan Labs
            </p>
            <p className="text-sm text-muted-foreground">
              A software engineering firm specializing in Go, Rust, Kubernetes, and AI implementations. We deliver training, consulting, and development services to help teams build scalable systems.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:underline">
              Learn more at ardanlabs.com
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </div>
        </a>
        </div>
      </div>
      )}
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-bold text-primary">kronk</span>
          <span className="text-sm text-muted-foreground">
            © 2025-2026 Ardan Labs. Apache-2.0 License.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>
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
