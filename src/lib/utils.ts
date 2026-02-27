import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolves asset paths for both local dev and production. */
export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const p = path.startsWith("/") ? path.slice(1) : path;
  const relativePath = `${base.endsWith("/") ? base : base + "/"}${p}`;
  // Use absolute URL so images work in both dev (localhost) and production
  if (typeof window !== "undefined") {
    return new URL(relativePath, window.location.origin).href;
  }
  return relativePath;
}
