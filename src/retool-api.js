import { API_ENDPOINTS, MESSAGES, REQUEST_HEADERS } from './constants.js';
import { httpClient } from './utils/http-client.js';

class RetoolApi {
  async getPages(xsrfToken) {
    const headers = {
      [REQUEST_HEADERS.XSRF_TOKEN]: xsrfToken
    };

    const response = await httpClient.get(API_ENDPOINTS.PAGES, headers);
    if (!response.ok) {
      throw new Error(MESSAGES.LOAD_ERROR(response.status))
    }
    const { pages } = await response.json();
    
    return pages.map(page => ({
      name: page.name,
      accessLevel: page.accessLevel,
      deleted: !!page.deletedAt,
      lastEditedBy: page.lastEditedBy,
      uuid: page.uuid,
    }));
  }

  async exportApp(uuid, xsrfToken) {
    const headers = {
      [REQUEST_HEADERS.XSRF_TOKEN]: xsrfToken
    };

    const exportUrl = API_ENDPOINTS.EXPORT(uuid);
    const response =  await httpClient.post(exportUrl, null, headers);
    return await response.text();
  }

  async getAppContent(uuid, xsrfToken) {
    try {
      console.log(`trying to export: `, { uuid, xsrfToken });
      return await this.exportApp(uuid, xsrfToken);
    } catch (error) {
      throw new Error(`Ошибка поиска в приложении ${uuid}: ${error.message}`);
    }
  }

  async searchInApp(uuid, searchText, xsrfToken) {
    try {
      console.log(`trying to export: `, { uuid, xsrfToken });
      const appContent = await this.exportApp(uuid, xsrfToken);
      return appContent.includes(searchText);
    } catch (error) {
      throw new Error(`Ошибка поиска в приложении ${uuid}: ${error.message}`);
    }
  }
}

export const retoolApi = new RetoolApi();
