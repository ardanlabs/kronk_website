import React from "react";

const KEYWORDS = new Set([
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
  "map", "package", "range", "return", "select", "struct", "switch", "type", "var",
]);

const TYPES = new Set([
  "bool", "byte", "complex64", "complex128", "error", "float32", "float64",
  "int", "int8", "int16", "int32", "int64", "rune", "string", "uint", "uint8",
  "uint16", "uint32", "uint64", "uintptr", "any",
]);

const BUILTINS = new Set([
  "append", "cap", "close", "complex", "copy", "delete", "imag", "len", "make",
  "new", "panic", "print", "println", "real", "recover",
]);

const CONSTANTS = new Set(["true", "false", "nil", "iota"]);

// Order matters: comments, strings (raw, double, char), numbers, identifiers.
const TOKEN_RE =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|(`[^`]*`)|('(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

export const GoCode: React.FC<{ code: string }> = ({ code }) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index!;
    if (idx > last) parts.push(code.slice(last, idx));

    const [full, lineComment, blockComment, dq, bt, sq, num, ident] = m;
    let cls = "";

    if (lineComment || blockComment) {
      cls = "italic text-slate-500 dark:text-slate-400";
    } else if (dq || bt || sq) {
      cls = "text-emerald-700 dark:text-emerald-300";
    } else if (num) {
      cls = "text-orange-600 dark:text-orange-300";
    } else if (ident) {
      if (KEYWORDS.has(ident)) cls = "text-violet-600 dark:text-violet-300";
      else if (TYPES.has(ident)) cls = "text-sky-600 dark:text-sky-300";
      else if (BUILTINS.has(ident)) cls = "text-amber-700 dark:text-amber-300";
      else if (CONSTANTS.has(ident)) cls = "text-orange-600 dark:text-orange-300";
    }

    if (cls) {
      parts.push(
        <span key={key++} className={cls}>
          {full}
        </span>
      );
    } else {
      parts.push(full);
    }

    last = idx + full.length;
  }

  if (last < code.length) parts.push(code.slice(last));

  return <>{parts}</>;
};
