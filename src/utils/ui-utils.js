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
      html += '<p>Найденные приложения:</p>';
      html += '<ul>';
      html += foundApps
        .map(app => {
          let appHtml = `<li>${app.name}`;
          if (app.usages && app.usages.length > 0) {
            appHtml += '<ul>';
            appHtml += app.usages.map(usage => `<li>${usage}</li>`).join('\n');
            appHtml += '</ul>';
          }
          appHtml += '</li>';
          return appHtml;
        })
        .join('\n');
      html += '</ul>';
    } else {
      html += `<p>${MESSAGES.NO_RESULTS}</p>`;
    }

    if (errorApps.length > 0) {
      html += '<p>Ошибки при поиске:</p>';
      html += '<ul>';
      html += errorApps.map(app => `<li>${app.name} (${app.error})</li>`).join('\n');
      html += '</ul>';
    }

    this.updateOutput(html);
  }

  static showError(message) {
    this.updateOutput(message);
  }

  static getSearchValue() {
    const searchInput = document.getElementById('search');
    return searchInput ? searchInput.value.trim() : '';
  }

  static isSearchValueValid() {
    const searchValue = this.getSearchValue();
    return searchValue.length > 0;
  }
}
