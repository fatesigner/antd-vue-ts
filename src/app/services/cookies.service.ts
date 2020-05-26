/**
 * cookies
 */

import Cookies from 'js-cookie';

import { AppKey } from '../global';

class CookiesServiceStatic {
  private appKey = '';

  constructor(appKey: string) {
    this.appKey = appKey;
  }

  get(key: string) {
    return Cookies.get(this.appKey + '-' + key);
  }

  set(key: string, value: string) {
    return Cookies.set(this.appKey + '-' + key, value);
  }
}

export const CookiesService = new CookiesServiceStatic(AppKey);
