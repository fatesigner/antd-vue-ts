/**
 * i18n
 */

import { VueI18n } from '@fatesigner/i18n';
import { ValueOf } from '@fatesigner/typed';
import { ConvertModelArrToEnum } from '@fatesigner/utils';

import { I18nkeys } from './keys';
import moment from 'moment';

// 定义 language 类型
export const Languages = ConvertModelArrToEnum([
  {
    name: 'zhCN',
    value: 'zh-CN',
    text: '简体中文'
  },
  {
    name: 'enUS',
    value: 'en-US',
    text: 'English'
  }
]);

export type LanguageType = ValueOf<typeof Languages.enum>;

// 初始化 i18n
export const i18n = new VueI18n(
  {
    keys: I18nkeys,
    loadLocale(lang) {
      return import(`./lang/${lang}`).then(async (msg) => {
        return msg.default;
      });
    }
  },
  {
    locale: null,
    messages: {}
  }
);

// 注册勾子，当语言包加载完成后执行
i18n.hooks.afterSet.tap(function (lang) {
  // request.headers['Accept-Language'] = lang;
  document.querySelector('html').setAttribute('lang', lang);
});

i18n.hooks.afterSet.tapAsync(async (lang) => {
  // 导入 moment language，非中文环境统一使用英文
  if (lang === 'zh-CN') {
    import('moment/locale/zh-cn').then(() => {
      moment.locale(lang.toLocaleLowerCase());
    });
  } else {
    import('moment/locale/fr').then(() => {
      moment.locale(lang.toLocaleLowerCase());
    });
  }
});

i18n.set('zh-CN');
