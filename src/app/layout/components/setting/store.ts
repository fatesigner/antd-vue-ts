/**
 * store
 */

import { CreateVuexStore } from '@fatesigner/vue-lib/vuex';
import { LocalStorage } from '@fatesigner/utils/local-storage';
import ThemeUtil from '../../../../lib/antdv-ui/utils/theme';

import { i18n, Languages, LanguageType } from '../../../i18n';
import { ISetting } from '../../../interfaces/setting';

// 主体类型
type ThemeType = 'dark' | 'light';

export type ISettingState = ISetting<LanguageType, ThemeType> & {
  visible: boolean;
};

const localStorageKey = 'setting';

// 从 storage 中获取
let setting: ISettingState = LocalStorage.get(localStorageKey);

if (!setting) {
  // 根据当前客户端环境设置对应的语言
  let language: LanguageType = navigator.language.toLowerCase() as any;

  // 若该语言未提供，则设置默认
  if (Languages.values.indexOf(language) < 0) {
    language = 'zh-CN';
  }

  setting = {
    visible: false,
    language: language,
    theme: 'light',
    color: '#1890FF',
    colorWeak: false,
    colors: [
      {
        name: '拂晓蓝（默认）',
        code: '#1890FF'
      },
      {
        name: '薄暮',
        code: '#F5222D'
      },
      {
        name: '火山',
        code: '#FA541C'
      },
      {
        name: '日暮',
        code: '#FAAD14'
      },
      {
        name: '明青',
        code: '#13C2C2'
      },
      {
        name: '极光绿',
        code: '#52C41A'
      },
      {
        name: '极客蓝',
        code: '#2F54EB'
      },
      {
        name: '酱紫',
        code: '#722ED1'
      }
    ]
  };
}

setting = Object.assign(setting, {
  visible: false
});

// 初始化语言
i18n.set(setting.language);
// ThemeUtil.changeColor(setting.color);

export const SystemSettingStore = CreateVuexStore({
  name: 'systemSetting',
  state: setting,
  actions: {
    update(context, setting: ISettingState) {
      context.commit('update', setting);
    },
    updateLang(context, lang: LanguageType) {
      if (lang) {
        return i18n.set(lang).then(() => {
          context.commit('update', {
            language: lang
          });
        });
      }
    },
    updateColor(context, color: string) {
      if (color) {
        return ThemeUtil.changeColor(color).then(() => {
          context.commit('update', {
            color: color
          });
        });
      }
      return Promise.resolve();
    }
  },
  getters: {
    setting: (state) => state
  },
  mutations: {
    update(state, playload) {
      state = Object.assign(state, playload);

      // 缓存到 local storage
      LocalStorage.set(localStorageKey, state);
    }
  }
});
