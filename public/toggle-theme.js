window.addEventListener("DOMContentLoaded", () => {
  const primaryColorScheme = ""; // "light" | "dark"

  // Get theme data from local storage

  function getPreferTheme() {
    const currentTheme = localStorage.getItem("theme");
    // return theme value in local storage if it is set
    if (currentTheme) return currentTheme;

    // return primary color scheme if it is set
    if (primaryColorScheme) return primaryColorScheme;

    // return user device's prefer color scheme
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setPreference(theme) {
    localStorage.setItem("theme", theme);
    reflectPreference(theme);
  }

  function reflectPreference(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");

    document.querySelector("#theme-btn")?.setAttribute("aria-label", theme);
  }

  // set early so no page flashes / CSS is made aware
  reflectPreference(getPreferTheme());

  // now this script can find and listen for clicks on the control
  document.querySelector("#theme-btn").addEventListener("click", () => {
    setPreference(getPreferTheme() === "light" ? "dark" : "light");
  });

  // sync with system changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches: isDark }) => {
      setPreference(isDark ? "dark" : "light");
    });
});
