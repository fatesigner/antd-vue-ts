/**
 * html5 本地存储
 */

let Identification = '';

export function SetIdentification(identification) {
  Identification = identification;
}

export const LocalStorage = {
  // 标识符，用于区分不同的应用
  set(key: string, data: any) {
    return window.localStorage.setItem(Identification + '_' + key, JSON.stringify(data));
  },
  get(key: string) {
    return JSON.parse(window.localStorage.getItem(Identification + '_' + key));
  },
  remove(key: string) {
    return window.localStorage.removeItem(Identification + '_' + key);
  }
};
