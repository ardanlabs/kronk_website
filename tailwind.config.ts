import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        code: {
          bg: "hsl(var(--code-bg))",
          border: "hsl(var(--code-border))",
          header: "hsl(var(--code-header))",
        },
        bucky: {
          ink: "rgb(var(--bucky-ink) / <alpha-value>)",
          raised: "rgb(var(--bucky-raised) / <alpha-value>)",
          panel: "rgb(var(--bucky-panel) / <alpha-value>)",
          line: "rgb(var(--bucky-line) / <alpha-value>)",
          fog: "rgb(var(--bucky-fog) / <alpha-value>)",
          paper: "rgb(var(--bucky-paper) / <alpha-value>)",
          gold: "rgb(var(--bucky-gold) / <alpha-value>)",
          "gold-bright": "rgb(var(--bucky-gold-bright) / <alpha-value>)",
          forest: "rgb(var(--bucky-forest) / <alpha-value>)",
          "forest-dim": "rgb(var(--bucky-forest-dim) / <alpha-value>)",
          "action-ink": "rgb(var(--bucky-action-ink) / <alpha-value>)",
          action: "rgb(var(--bucky-action) / <alpha-value>)",
          "action-hover": "rgb(var(--bucky-action-hover) / <alpha-value>)",
        },
        malina: {
          ink: "rgb(var(--malina-ink) / <alpha-value>)",
          raised: "rgb(var(--malina-raised) / <alpha-value>)",
          panel: "rgb(var(--malina-panel) / <alpha-value>)",
          line: "rgb(var(--malina-line) / <alpha-value>)",
          fog: "rgb(var(--malina-fog) / <alpha-value>)",
          paper: "rgb(var(--malina-paper) / <alpha-value>)",
          gold: "rgb(var(--malina-gold) / <alpha-value>)",
          "gold-bright": "rgb(var(--malina-gold-bright) / <alpha-value>)",
          red: "rgb(var(--malina-red) / <alpha-value>)",
          "red-dim": "rgb(var(--malina-red-dim) / <alpha-value>)",
          pink: "rgb(var(--malina-pink) / <alpha-value>)",
          "action-ink": "rgb(var(--malina-action-ink) / <alpha-value>)",
          action: "rgb(var(--malina-action) / <alpha-value>)",
          "action-hover": "rgb(var(--malina-action-hover) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bucky-fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bucky-terminal-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "bucky-caret": {
          "0%, 45%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bucky-fade-up": "bucky-fade-up 0.7s ease-out both",
        "bucky-terminal-in": "bucky-terminal-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both",
        "bucky-caret": "bucky-caret 1.1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
