import { App } from './src/app.js';
import { ThemeManager } from './src/theme.js';

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  const app = new App();
  app.populateEnv().catch(console.error);
});
