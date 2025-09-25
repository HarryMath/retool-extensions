// Theme detection and management for Chrome extension
export class ThemeManager {
  static init() {
    this.detectChromeTheme();
    this.setupThemeListener();
  }

  static detectChromeTheme() {
    // Check if Chrome is in dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  static setupThemeListener() {
    // Listen for theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        this.detectChromeTheme();
      });
    }
  }
}
