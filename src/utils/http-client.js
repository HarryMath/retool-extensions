import { Env } from '../env.js';


class HttpClient {
  async request(url, options = {}) {
    const base = Env.getBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const requestOptions = { ...defaultOptions, ...options };

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
