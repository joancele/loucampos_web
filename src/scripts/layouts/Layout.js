import { translations } from "../../i18n/translations";

// Run immediately to prevent Flash of Unstyled Content (FOUC)
const getThemePreference = () => {
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem("color-theme")
  ) {
    return localStorage.getItem("color-theme");
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const setupTheme = () => {
  const isDark = getThemePreference() === "dark";
  document.documentElement.classList[isDark ? "add" : "remove"]("dark");
};

setupTheme();

function applyTranslations() {
  const userLang = navigator.language || navigator.userLanguage;
  let lang = "es"; // default
  if (userLang.startsWith("en")) lang = "en";
  if (userLang.startsWith("ja")) lang = "ja";

  const t = translations[lang];
  if (!t) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && t[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
}

const setupImageProtection = () => {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
};

const setupInteractions = () => {
  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    // Clear previous listeners to avoid duplicates if any
    const newThemeToggleBtn = themeToggleBtn.cloneNode(true);
    themeToggleBtn.parentNode.replaceChild(newThemeToggleBtn, themeToggleBtn);

    newThemeToggleBtn.addEventListener("click", function () {
      if (localStorage.getItem("color-theme")) {
        if (localStorage.getItem("color-theme") === "light") {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        }
      } else {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        }
      }
    });
  }

  // Mobile Menu Logic
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    const newMobileMenuBtn = mobileMenuBtn.cloneNode(true);
    mobileMenuBtn.parentNode.replaceChild(newMobileMenuBtn, mobileMenuBtn);

    newMobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const icon = newMobileMenuBtn.querySelector("span");
      if (icon) {
        if (mobileMenu.classList.contains("hidden")) {
          icon.textContent = "menu";
        } else {
          icon.textContent = "close";
        }
      }
    });
  }
};

// Run on initial load and after view transitions
document.addEventListener("astro:page-load", () => {
  setupTheme();
  setupInteractions();
  setupImageProtection();
  applyTranslations();
});
