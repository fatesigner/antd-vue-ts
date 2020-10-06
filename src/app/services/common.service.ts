/**
 * common.service
 */

class CommonServiceStatic {
  // 动态添加角色选择控件，用于 develop 模式
  appendRadios<T extends { name: string; text: string }>(
    name: string,
    title: string,
    value: string,
    arr: T[],
    container: HTMLElement,
    targetEl: HTMLElement,
    callback: (arg0: T) => any
  ) {
    let htmlStr = '';
    let cur = -1;
    if (value) {
      const i = arr.findIndex((x) => x.name === value);
      if (i > -1) {
        cur = i;
      }
    }
    arr.forEach((role, index) => {
      htmlStr += `<label class="roles-radios" style="margin-right: 5px; white-space: nowrap; cursor: pointer;"><input name="${name}" type="radio" value="${index}" ${
        index === cur ? 'checked' : ''
      }/>&nbsp;${role.text}</label>&nbsp;`;
    });
    htmlStr = `<div style="display: flex;margin-bottom: 10px;"><strong style="white-space: nowrap;">${title}：</strong><div>${htmlStr}</div></div>`;
    const element = document.createElement('div');
    element.innerHTML = htmlStr;
    container.insertBefore(element.children[0], targetEl || container.firstChild);
    // 绑定 radio change 事件
    container.querySelectorAll(`.roles-radios input[name='${name}']`).forEach(($radio: HTMLElement) => {
      $radio.onclick = (e: any) => {
        callback(arr[e.target.value]);
      };
    });
    if (cur > -1) {
      callback(arr[cur]);
    }
  }

  getOffset(element: any, target: HTMLElement = null) {
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

  registerStoreModule({ module, moduleName, store }: any) {
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
  exportStreamFile(data: any, filename: string, contentType = 'application/octet-stream'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (data) {
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data]), filename);
          resolve();
        } else {
          const url = window.URL.createObjectURL(new Blob([data], { type: contentType }));
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          resolve();
        }
      } else {
        reject(new Error('文件不存在'));
      }
    });
  }

  /**
   * 获取指定的时间戳对应的时分秒的值
   * @timestamp number
   * @constructor
   */
  getTimestamp(timestamp: number) {
    const res = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (timestamp >= 86400000) {
      res.days = Math.floor(timestamp / 86400000);
      timestamp = timestamp % 86400000;
    }

    if (timestamp >= 3600000) {
      res.hours = Math.floor(timestamp / 3600000);
      timestamp = timestamp % 3600000;
    }

    if (timestamp >= 60000) {
      res.minutes = Math.floor(timestamp / 60000);
      timestamp = timestamp % 60000;
    }

    res.seconds = Math.floor(timestamp / 1000);

    return res;
  }

  /**
   * 获取指定的时间戳对应的时分秒的字符串
   * @param timestamp
   * @param format
   */
  getTimestampStr(
    timestamp: number,
    format?: {
      day?: string;
      hour?: string;
      minute?: string;
      second?: string;
    }
  ) {
    const res = this.getTimestamp(timestamp);
    let str = '';
    if (format?.day && res.days) {
      str += res.days.toString() + format?.day;
    }
    if (format?.hour && res.hours) {
      str += res.hours.toString() + format?.hour;
    }
    if (format?.minute && res.minutes) {
      str += res.minutes.toString() + format?.minute;
    }
    if (format?.second && res.seconds) {
      str += res.seconds.toString() + format?.second;
    }
    return str;
  }
}

export const CommonService = new CommonServiceStatic();
