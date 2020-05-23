/**
 * index
 */

import Vue from 'vue';
import VueI18n from 'vue-i18n';

// element-ui built-in lang
import elementEnLocale from 'element-ui/lib/locale/lang/en';
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN';

import { getLanguage } from '../cookies';

// User defined lang
import { en } from './lang/en';
import { zh } from './lang/zh';
import { ILocalekeys } from './type';

Vue.use(VueI18n);

const messages = {
  en: {
    ...en,
    ...elementEnLocale
  },
  zh: {
    ...zh,
    ...elementZhLocale
  }
};

export const getLocale = () => {
  const cookieLanguage = getLanguage();
  if (cookieLanguage) {
    return cookieLanguage;
  }

  const language = navigator.language.toLowerCase();
  const locales = Object.keys(messages);
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale;
    }
  }

  // set default language
  return 'zh';
};

export const i18n = new VueI18n({
  locale: getLocale(),
  messages
});

export * from './localekeys';
