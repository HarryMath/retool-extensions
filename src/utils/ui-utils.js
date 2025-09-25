import { MESSAGES } from '../constants.js';


const outputElement = document.getElementById('output');

export class UIUtils {

  static updateOutput(html) {
    outputElement.innerHTML = html;
  }

  static showSearchProgress(current, total) {
    this.updateOutput(MESSAGES.SEARCHING_PROGRESS(current, total));
  }

  static showSearchResults(foundApps, errorApps) {
    let html = '';

    if (foundApps.length > 0) {
      html += '<div style="margin-bottom: 16px;">';
      html += `<h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Найденные приложения (${foundApps.length}):</h4>`;
      html += '<ul style="margin: 0; padding-left: 16px;">';
      html += foundApps
        .map(app => {
          let appHtml = `<li style="margin: 6px 0; line-height: 1.4;">`;
          appHtml += `<span>${app.name}</span>`;
          if (app.usages && app.usages.length > 0) {
            appHtml += '<ul style="margin: 4px 0 0 0; padding-left: 16px;">';
            appHtml += app.usages.map(usage => `<li style="margin: 2px 0; font-size: 12px; opacity: 0.8;">${usage}</li>`).join('');
            appHtml += '</ul>';
          }
          appHtml += '</li>';
          return appHtml;
        })
        .join('');
      html += '</ul>';
      html += '</div>';
    } else {
      html += `<p style="margin: 0; opacity: 0.7;">${MESSAGES.NO_RESULTS}</p>`;
    }

    if (errorApps.length > 0) {
      html += '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">';
      html += `<h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Ошибки при поиске (${errorApps.length}):</h4>`;
      html += '<ul style="margin: 0; padding-left: 16px;">';
      html += errorApps.map(app => `<li style="margin: 4px 0; color: #dc3545; font-size: 13px;">${app.name} <span style="opacity: 0.7;">(${app.error})</span></li>`).join('');
      html += '</ul>';
      html += '</div>';
    }

    this.updateOutput(html);
  }

  static showError(message) {
    this.updateOutput(`<p style="margin: 0; color: #dc3545; font-weight: 500;">${message}</p>`);
  }

  static getSearchValue() {
    const searchInput = document.getElementById('search');
    return searchInput ? searchInput.value.trim() : '';
  }

  static isCaseSensitive() {
    const caseSensitiveCheckbox = document.getElementById('caseSensitive');
    return caseSensitiveCheckbox ? caseSensitiveCheckbox.checked : false;
  }

  static isSearchValueValid() {
    const searchValue = this.getSearchValue();
    return searchValue.length > 0;
  }
}
