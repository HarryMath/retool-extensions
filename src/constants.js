export const API_ENDPOINTS = {
  PAGES: '/api/pages',
  EXPORT: (uuid) => `/api/pages/uuids/${uuid}/export`
};

export const COOKIE_SETTINGS = {
  XSRF_TOKEN_NAME: 'xsrfToken',
};

export const VALIDATION = {
  MIN_SEARCH_LENGTH: 5
};

export const MESSAGES = {
  SEARCH_TOO_SHORT: 'Текст поиска должен быть длинной 5 символов или более',
  TOKEN_ERROR: 'Не удалось получить токен',
  LOADING_APPS: 'Загружаю список приложений...',
  SEARCHING_PROGRESS: (current, total) => `Идет поиск (${current} из ${total}) ...`,
  LOAD_ERROR: (status) => `Ошибка загрузки ${status}`,
  NO_RESULTS: 'Приложения с указанным кодом не найдены',
  SEARCH_ERRORS: 'Ошибки при поиске:'
};

export const REQUEST_HEADERS = {
  XSRF_TOKEN: 'x-xsrf-token'
};
