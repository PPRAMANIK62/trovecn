/**
 * Runs before hydration so the correct theme class is on <html> for the
 * very first paint — avoids a light/dark flash on load.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("trovecn-theme");
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;
