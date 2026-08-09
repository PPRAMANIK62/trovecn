import { codeToHtml } from "shiki";

export function highlightCode(code: string, lang: "tsx" | "bash" = "tsx") {
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
  });
}
