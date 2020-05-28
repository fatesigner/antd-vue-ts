/**
 * common.service
 */

import VueRouter from 'vue-router';
import CryptoJS from 'crypto-js';
import { GetGUID } from '@forgleaner/utils/random';

import { IMenuLink } from '../interfaces/memu';
import { Role } from '../global';

class CommonServiceStatic {
  encryOptions = {
    iv: '1234567890hjlkew',
    key: '1234567890adbcde'
  };

  // AES加密 ：字符串 key iv  返回base64
  encrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(this.encryOptions.key);
    const iv = CryptoJS.enc.Utf8.parse(this.encryOptions.iv);

    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    });
    // console.log("-=-=-=-", encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  }

  // 动态添加角色选择控件，用于 develop 模式
  appendRoleRadios(container, targetEl, callback) {
    // 动态添加角色 radio 选择器
    let htmlStr = '';
    // 默认选中第一项
    const cur = 0;
    Role.arr.forEach((role, index) => {
      htmlStr += `<label class="roles-radios" style="margin-right: 5px; cursor: pointer;"><input name="role" type="radio" value="${index}" ${
        index === cur ? 'checked' : ''
      }/>&nbsp;${role.text}</label>&nbsp;`;
    });
    htmlStr = `<div style="margin-bottom: 10px">${htmlStr}</div>`;
    const element = document.createElement('div');
    element.innerHTML = htmlStr;
    container.insertBefore(element.children[0], targetEl || container.firstChild);
    // 绑定 radio change 事件
    container.querySelectorAll('.roles-radios input').forEach(($radio) => {
      $radio.onclick = (e) => {
        callback(Role.arr[e.target.value]);
      };
    });
    callback(Role.arr[cur]);
  }

  getVueRegistedRouters($router: VueRouter): IMenuLink[] {
    const menuLinks: IMenuLink[] = [];

    for (const route of ($router as any).options.routes) {
      let label = '';
      if (route.meta && route.meta.label) {
        label = route.meta.label;
      }
      menuLinks.push({
        id: GetGUID().toLowerCase(),
        url: route.path,
        label
      });
      console.log(
        JSON.stringify({
          name: route.name,
          path: route.path,
          meta: route.meta
        })
      );
    }

    return menuLinks;
  }

  getOffset(element, target = null) {
    const offset = {
      left: 0,
      top: 0
    };
    while (element !== target) {
      offset.left += element.offsetLeft;
      offset.top += element.offsetTop;
      element = element.offsetParent;
    }
    return offset;
  }

  registerStoreModule({ module, moduleName, store }) {
    const moduleIsRegistered = store._modules.root._children[moduleName] !== undefined;
    const stateExists = store.state[moduleName];
    if (!moduleIsRegistered) {
      store.registerModule(moduleName, module, { preserveState: stateExists });
    }
  }

  // 导入流文件
  importStreamFile(accept = '') {
    return new Promise((resolve, reject) => {
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e: any) => {
        const files = e.target.files;
        if (!files || !files.length) {
          input = null;
          reject(new Error('file not exist.'));
        }
        const reader = new FileReader();
        reader.onload = (e2: any) => {
          try {
            resolve(JSON.parse(e2.target.result));
          } catch (e) {
            reject(e);
          }
          input = null;
        };
        reader.readAsText(files[0]);
      };
      input.click();
    });
  }

  // 导出文件
  exportStreamFile(filename: string, content: string) {
    const link = document.createElement('a');
    link.download = filename;
    const blob = new Blob([content]);
    link.href = URL.createObjectURL(blob);
    link.click();
  }
}

export const CommonService = new CommonServiceStatic();
