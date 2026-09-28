import type { ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-java";

// Prism's Java grammar already includes var, yield, record, sealed, and module
// keywords. Add the two contextual forms used by current exam code without
// changing Prism's shared grammar for any other language consumers.
const java25Grammar = Prism.languages.insertBefore(
  "java",
  "keyword",
  {
    "java-25-keyword": [
      {
        // Prism is a highlighter rather than a Java parser: the exact word is
        // needed because the case's type is usually a separate class token.
        pattern: /\bwhen\b/,
        alias: "keyword",
      },
      {
        // Standalone _ is the unnamed-variable/pattern keyword.
        pattern: /(^|[^\w$])_(?![\w$])/,
        lookbehind: true,
        alias: "keyword",
      },
    ],
  },
  { java: Prism.languages.extend("java", {}) },
);

/**
 * Tokenize the entire snippet before splitting it into display lines. This keeps
 * comments and Java text blocks in the same token across line boundaries.
 * Every fragment is a React text node or span, so source code is never injected
 * as HTML.
 */
export function highlightJavaLines(code: string): ReactNode[][] {
  const lines: ReactNode[][] = [[]];
  let key = 0;

  function appendText(value: string, classes: string[]): void {
    const parts = value.split("\n");

    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part.length === 0) return;

      lines[lines.length - 1].push(
        classes.length > 0 ? (
          <span key={key++} className={`token ${classes.join(" ")}`}>
            {part}
          </span>
        ) : (
          part
        ),
      );
    });
  }

  function appendToken(token: string | Prism.Token, inherited: string[] = []): void {
    if (typeof token === "string") {
      appendText(token, inherited);
      return;
    }

    const aliases = token.alias
      ? Array.isArray(token.alias)
        ? token.alias
        : [token.alias]
      : [];
    const classes = [token.type, ...aliases];
    const content = token.content;

    if (typeof content === "string") {
      appendText(content, classes);
    } else if (Array.isArray(content)) {
      // Prism's nested tokens supply their own type. Plain fragments still
      // inherit the enclosing token's class.
      content.forEach((child) => appendToken(child, classes));
    } else {
      appendToken(content, classes);
    }
  }

  Prism.tokenize(code, java25Grammar).forEach((token) => appendToken(token));
  return lines;
}
