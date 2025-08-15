import { API_BASE_URL } from '../constants.js';


class HttpClient {
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const requestOptions = { ...defaultOptions, ...options };

    console.log('try to fetch: ', {
      fullUrl,
      requestOptions
    });
    const response = await fetch(fullUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  async get(url, headers = {}) {
    return this.request(url, { method: 'GET', headers });
  }

  async post(url, data = null, headers = {}) {
    const options = { method: 'POST', headers };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(url, options);
  }
}

export const httpClient = new HttpClient();
