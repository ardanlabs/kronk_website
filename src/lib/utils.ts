import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolves asset paths for GitHub Pages base path (e.g. /kronk_website/) */
export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${p}`;
}
