import { COOKIE_SETTINGS } from '../constants.js';


export const getCookie = (domain, name) => {
  return new Promise(resolve => {
    chrome.cookies.get({ url: domain, name }, (cookie) => {
      resolve(cookie ? cookie.value : null);
    });
  });
};


export const getXsrfToken = async () => {
  return await getCookie(
    COOKIE_SETTINGS.DOMAIN, 
    COOKIE_SETTINGS.XSRF_TOKEN_NAME
  );
};
