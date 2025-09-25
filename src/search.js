import { VALIDATION, MESSAGES } from './constants.js';
import { getXsrfToken } from './utils/cookie-utils.js';
import { retoolApi } from './retool-api.js';
import { UIUtils } from './utils/ui-utils.js';


export class Search {

  static validateSearchInput(searchText) {
    return searchText.length >= VALIDATION.MIN_SEARCH_LENGTH;
  }

  static async searchApps(searchText, isCaseSensitive = false) {
    try {
      if (!this.validateSearchInput(searchText)) {
        UIUtils.showError(MESSAGES.SEARCH_TOO_SHORT);
        return;
      }

      const xsrfToken = await getXsrfToken();
      if (!xsrfToken) {
        UIUtils.showError(MESSAGES.TOKEN_ERROR);
        return;
      }

      UIUtils.updateOutput(MESSAGES.LOADING_APPS);
      const pages = await retoolApi.getPages(xsrfToken);

      const { foundApps, errorApps } = await this.searchInAllApps(pages, searchText, xsrfToken, isCaseSensitive);

      UIUtils.showSearchResults(foundApps, errorApps);

    } catch (error) {
      console.error('Ошибка при поиске приложений:', error);
      UIUtils.showError(`Ошибка: ${error.message}`);
    }
  }

  static async searchInAllApps(pages, searchText, xsrfToken, isCaseSensitive = false) {
    const foundApps = [];
    const errorApps = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      UIUtils.showSearchProgress(i + 1, pages.length);

      try {
        let appContent = await retoolApi.getAppContent(page.uuid, xsrfToken);
        searchText = isCaseSensitive ? searchText : searchText.toLowerCase();
        appContent = isCaseSensitive ? appContent : appContent.toLowerCase();
        const isFound = appContent.includes(searchText);
        
        if (isFound) {
          const usages = Search.deepSearchInApp(appContent, searchText, isCaseSensitive) || [];
          foundApps.push({
            name: page.name,
            usages
          });
        }
      } catch (error) {
        errorApps.push({
          name: page.name,
          error: error.message
        });
      }
    }

    return { foundApps, errorApps };
  }

  static deepSearchInApp(appContent, searchText, isCaseSensitive = false) {
    const appStateKey = isCaseSensitive ? 'appState' : 'appstate';
    try {
      if (typeof appContent === 'string') {
        appContent = JSON.parse(appContent);
      }
      const appState = JSON.parse( appContent.page.data?.[appStateKey] || '{}' );

      let removeKeys = [
        'plugins', '~#iOM', '^0', appStateKey, 'v', '~#iR', '^2R', '^2K'
      ];
      if (!isCaseSensitive) {
        removeKeys = removeKeys.map(k => k.toLowerCase());
      }

      const joinSymbol = ' -> ';

      const recursiveSearch = (content, previousKey) => {
        if (!content || ['boolean', 'number'].includes(typeof content)) {
          return null;
        }
        if (typeof content === 'string') {
          return content.includes(searchText)
            ? [previousKey + '->' + content]
            : null;
        }
        if (Array.isArray(content)) {
          const result = [];
          let foundAtPrevious = false;
          for (let i = 0; i < content.length; i++) {
            const key = (typeof content[i - 1] === 'string' && !foundAtPrevious)
              ? content[i - 1]
              : String(i);
            const subResult = recursiveSearch(content[i], previousKey + joinSymbol + key);
            if (subResult?.length) {
              foundAtPrevious = true
              result.push(...subResult);
            } else {
              foundAtPrevious = false;
            }
          }
          return result.length ? result.flat() : null;
        }
        if (typeof content === 'object') {
          const result = Object.keys(content)
            .map(key => recursiveSearch(content[key], previousKey + ' -> ' + key))
            .filter(Boolean);
          return result.length ? result.flat() : null;
        }
        return null;
      }

      let searchResult = recursiveSearch(appState, appStateKey);

      if (searchResult?.length) {
        for (let i = 0; i < searchResult?.length; i++) {
          let str = searchResult[i];
          const match = str.match(/plugins\s*->\s*[^>]+->\s*([A-Za-z0-9_]+)\s*->\s*\^0/);
          if (match) {
            searchResult[i] = match[1];
          } else {
            for (const key of removeKeys) {
              str = str.replace(key + joinSymbol, '').trim();
            }
            searchResult[i] = str;
          }
        }
      }

      return Array.from(new Set(searchResult));
    } catch (err) {
      console.warn('Failed to parse app: ', err);
    }
  }
}
