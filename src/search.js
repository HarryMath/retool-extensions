import { VALIDATION, MESSAGES } from './constants.js';
import { getXsrfToken } from './utils/cookie-utils.js';
import { retoolApi } from './retool-api.js';
import { UIUtils } from './utils/ui-utils.js';


export class Search {

  static IN_CHANGES_HISTORY = 'In changes history';
  static SEARCHED_COUNT = 0;

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

      Search.SEARCHED_COUNT = 0;
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

    const searchPromises = pages.map(page => Search.searchInPageSafeWithCounter(page, xsrfToken, searchText, isCaseSensitive, pages.length));

    const result = await Promise.all(searchPromises);
    result.forEach(r => {
      if (r?.status === 'success') {
        foundApps.push(r);
      } else if (r?.status === 'error') {
        errorApps.push(r);
      }
    });

    return { foundApps, errorApps };
  }

  static async searchInPageSafeWithCounter(page, xsrfToken, searchText, isCaseSensitive, totalCount) {
    const result = await Search.searchInPageSafe(page, xsrfToken, searchText, isCaseSensitive);
    UIUtils.showSearchProgress(++Search.SEARCHED_COUNT, totalCount)
    return result;
  }

  static async searchInPageSafe(page, xsrfToken, searchText, isCaseSensitive = false) {
    try {
      let appContent = await retoolApi.getAppContent(page.uuid, xsrfToken);
      searchText = isCaseSensitive ? searchText : searchText.toLowerCase();
      appContent = isCaseSensitive ? appContent : appContent.toLowerCase();
      const isFound = appContent.includes(searchText);

      if (isFound) {
        const usages = Search.deepSearchInApp(appContent, searchText, isCaseSensitive) || [];
        if (usages.length === 1 && usages.includes(Search.IN_CHANGES_HISTORY)) {
          return null; // skip this app because found only in changes history
        }
        return {
          status: 'success',
          name: page.name,
          usages
        };
      }
    } catch (err) {
      return {
        status: 'error',
        name: page.name,
        error: err.message,
      }
    }
  }

  static deepSearchInApp(appContent, searchText, isCaseSensitive = false) {
    const prepareCase = (val) => isCaseSensitive ? val : val.toLowerCase();
    const appStateKey = prepareCase('appState');
    const changesRecordKey = prepareCase('changesRecord');
    const moduleNameKey = prepareCase('moduleName');

    const joinSymbol = ' -> ';
    let removeKeys = [
      'plugins', '~#iOM', '^0', appStateKey, 'v', '~#iR', '^2R', '^2K'
    ];
    if (!isCaseSensitive) {
      removeKeys = removeKeys.map(k => k.toLowerCase());
    }

    try {
      if (typeof appContent === 'string') {
        appContent = JSON.parse(appContent);
      }
      // window.appContent = appContent;
      // console.log({ appContent });

      let appState = appContent.page.data?.[appStateKey] || '{}';

      let searchResult;

      if (appState.includes(searchText)) {
        appState = JSON.parse(appState);

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

        try {
          searchResult = recursiveSearch(appState, appStateKey) || [];
        } catch (err) {
          searchResult = [];
          console.error('Failed to parse appState', err);
        }

        if (searchResult.length === 0) {
          searchResult.push('In appState');
        }

      } else {
        searchResult = [];
      }

      if (
        appContent.page?.[changesRecordKey] &&
        JSON.stringify(appContent.page[changesRecordKey]).includes(searchText)
      ) {
        searchResult.push(Search.IN_CHANGES_HISTORY);
      }

      const modules = appContent.modules;
      if (modules) {
        Object.keys(modules).forEach(m => {
          if (modules[m]?.data?.[appStateKey]?.includes(searchText)) {
            searchResult.push(`In child module "${modules[m][moduleNameKey]}"`);
          }
        });
      }

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
