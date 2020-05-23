/**
 * utils
 */

export function GetScrollTop(dom) {
  if (!dom) {
    dom = document;
  }
  return dom.documentElement.scrollTop || dom.body.scrollTop;
}

export function GetOffset(element, target = null) {
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

export function RegisterStoreModule({ module, moduleName, store }) {
  const moduleIsRegistered = store._modules.root._children[moduleName] !== undefined;
  const stateExists = store.state[moduleName];
  if (!moduleIsRegistered) {
    store.registerModule(moduleName, module, { preserveState: stateExists });
  }
}

// 导入流文件
export function ImportStreamFile(accept = '') {
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
export function ExportStreamFile(filename: string, content: string) {
  const link = document.createElement('a');
  link.download = filename;
  const blob = new Blob([content]);
  link.href = URL.createObjectURL(blob);
  link.click();
}
