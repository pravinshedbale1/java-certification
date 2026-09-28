import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#141619" : "#f6f4ef");
    try {
      localStorage.setItem("forge-java25-theme", theme);
    } catch {
      // Theme switching remains available when browser storage is disabled.
    }
  }, [theme]);

  const dark = theme === "dark";
  const label = `Switch to ${dark ? "light" : "dark"} mode`;
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? (
        <Sun size={19} aria-hidden="true" />
      ) : (
        <Moon size={19} aria-hidden="true" />
      )}
      <span>{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
