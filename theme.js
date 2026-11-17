
(() => {
  const savedTheme = localStorage.getItem("sibella-theme") || "light";

  document.body.dataset.theme = savedTheme;

  function updateThemeButton() {
    const button = document.getElementById("themeBtn");
    if (!button) return;

    const dark = document.body.dataset.theme === "dark";

    button.textContent = dark ? "☀" : "☾";
    button.setAttribute(
      "aria-label",
      dark ? "Activer le mode clair" : "Activer le mode sombre"
    );
  }

  function toggleTheme() {
    const current = document.body.dataset.theme;
    const next = current === "dark" ? "light" : "dark";

    document.body.dataset.theme = next;
    localStorage.setItem("sibella-theme", next);

    updateThemeButton();
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateThemeButton();

    const button = document.getElementById("themeBtn");

    if (button) {
      button.addEventListener("click", toggleTheme);
    }
  });
})();
