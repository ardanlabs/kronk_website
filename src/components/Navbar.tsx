import { Link, useLocation, useNavigate } from "react-router-dom";
import { Github, Menu, X, Sun, Moon, BookOpen, FileText, Heart, Users } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navLinks = [
  { label: "Features", href: "/#features", tip: "See what makes Kronk powerful" },
  { label: "SDK", href: "/#sdk", tip: "Explore the Go SDK for local inference" },
  { label: "Install", href: "/#install", tip: "Get Kronk up and running" },
  { label: "Platform", href: "/#platform", tip: "Supported hardware and operating systems" },
  { label: "Examples", href: "/#examples", tip: "Ready-to-run code examples" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (e: React.MouseEvent, href: string) => {
    const [path, hash] = href.split("#");
    const targetId = hash;
    if (targetId && location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", window.location.pathname + "#" + targetId);
      }
    } else if (targetId && location.pathname !== "/") {
      e.preventDefault();
      navigate(href);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-xl font-bold text-primary"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          kronk
        </Link>

        <TooltipProvider>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.href}
                    onClick={(e) => handleSectionClick(e, link.href)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{link.tip}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/blog"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Blog
                </Link>
              </TooltipTrigger>
              <TooltipContent>Articles and tutorials about Kronk</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/manual"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <BookOpen className="h-5 w-5" />
                  Manual
                </Link>
              </TooltipTrigger>
              <TooltipContent>Full documentation and reference guide</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/sponsors"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                  Sponsors
                </Link>
              </TooltipTrigger>
              <TooltipContent>Organizations that support Kronk</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/contributors"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Contributors
                </Link>
              </TooltipTrigger>
              <TooltipContent>People who build Kronk</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/ardanlabs/kronk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>View the source code on GitHub</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isDark ? "Switch to light mode" : "Switch to dark mode"}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <button
          className="text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(e) => {
                    handleSectionClick(e, link.href);
                    setMobileOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/blog"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <FileText className="h-4 w-4" /> Blog
              </Link>
              <Link
                to="/manual"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <BookOpen className="h-4 w-4" /> Manual
              </Link>
              <Link
                to="/sponsors"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <Heart className="h-4 w-4" /> Sponsors
              </Link>
              <Link
                to="/contributors"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <Users className="h-4 w-4" /> Contributors
              </Link>
              <a
                href="https://github.com/ardanlabs/kronk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
