import { COOKIE_SETTINGS } from '../constants.js';
import { Env } from '../env.js';


export const getCookie = (domain, name) => {
  return new Promise(resolve => {
    chrome.cookies.get({ url: domain, name }, (cookie) => {
      resolve(cookie ? cookie.value : null);
    });
  });
};


export const getXsrfToken = async () => {
  return await getCookie(
    Env.getCookieDomain(), 
    COOKIE_SETTINGS.XSRF_TOKEN_NAME
  );
};
