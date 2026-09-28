import { isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { highlightJavaLines } from "../JavaSyntax";

function sourceText(node: ReactNode): string {
  if (Array.isArray(node)) return node.map(sourceText).join("");
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return sourceText(node.props.children);
  }
  return "";
}

function lineMarkup(line: ReactNode[]): string {
  return renderToStaticMarkup(<>{line}</>);
}

describe("highlightJavaLines", () => {
  it("preserves every character while carrying multiline comment and text block scopes", () => {
    const source = [
      "/* A record mentioned in a comment",
      " * stays a comment across lines. */",
      "String value = \"\"\"",
      "record inside a text block",
      "\"\"\";",
      "",
    ].join("\n");

    const lines = highlightJavaLines(source);

    expect(lines).toHaveLength(6);
    expect(lines.map(sourceText).join("\n")).toBe(source);
    expect(lineMarkup(lines[0])).toContain('class="token comment"');
    expect(lineMarkup(lines[1])).toContain('class="token comment"');
    expect(lineMarkup(lines[3])).toContain("token triple-quoted-string string");
    expect(lineMarkup(lines[3])).not.toContain("token keyword");
  });

  it("marks common Java 25 exam syntax with Prism token categories", () => {
    const source = "sealed interface Shape permits Circle {}\nrecord Circle(int radius) implements Shape { }\nSystem.out.println(25 + radius);";
    const markup = highlightJavaLines(source).map(lineMarkup).join("\n");

    expect(markup).toMatch(/class="token keyword">sealed<\/span>/);
    expect(markup).toMatch(/class="token keyword">record<\/span>/);
    expect(markup).toMatch(/class="token class-name">Circle<\/span>/);
    expect(markup).toMatch(/class="token function">println<\/span>/);
    expect(markup).toMatch(/class="token number">25<\/span>/);
    expect(markup).toMatch(/class="token operator">\+<\/span>/);
  });

  it("recognizes Java 25 case guards and unnamed variables along with module, var, and yield", () => {
    const source = [
      "import module java.base;",
      "var _ = switch (value) {",
      "  case String s when s.length() > 0 -> { yield 1; }",
      "  default -> 0;",
      "};",
    ].join("\n");
    const markup = highlightJavaLines(source).map(lineMarkup).join("\n");

    for (const keyword of ["module", "var", "yield"]) {
      expect(markup).toContain(`class="token keyword">${keyword}</span>`);
    }
    expect(markup).toContain('class="token java-25-keyword keyword">_</span>');
    expect(markup).toContain('class="token java-25-keyword keyword">when</span>');
    expect(highlightJavaLines(source).map(sourceText).join("\n")).toBe(source);
  });

  it("renders code as escaped React text", () => {
    const source = 'String html = "<script>alert(1)</script>";';
    const markup = highlightJavaLines(source).map(lineMarkup).join("\n");

    expect(markup).toContain("&lt;script&gt;");
    expect(markup).not.toContain("<script>");
  });
});
