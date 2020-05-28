/**
 * h5
 */

import { GetGUID } from '@forgleaner/utils/random';
import { IsNullOrUndefined } from '@forgleaner/utils/type-check';
import { On, RemoveElement, CreateElement } from '@forgleaner/utils/document';
import { BrowserPlatform } from '@forgleaner/utils/user-agent';

import { CompressImage, DefaultOptions, ValidateFile } from '../file-chooser';
import { IFileChooserChangeResponse, IFileChooserErrorResponse, IFileChooserOptions, IFileChooserService } from '../model';

export const FileChooserServiceH5: IFileChooserService = {
  openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      let options_: IFileChooserOptions = Object.assign({}, DefaultOptions, {
        name: GetGUID(10),
        clickable: false
      }, options);

      let inputEl = CreateInputEl(options_, resolve, reject);

      if (options_.targetEl) {
        options_.targetEl.appendChild(inputEl);
        if (options_.clickable) {
          On(options_.targetEl, 'click', undefined, function(e) {
            e.stopPropagation();
          });
          options_.targetEl.click();
        } else {
          inputEl.click();
        }
      } else {
        document.body.appendChild(inputEl);
        inputEl.click();
      }
    });
  },
  createFileChooser(options?: IFileChooserOptions, resolve?: (res: IFileChooserChangeResponse) => void, reject?: (error: IFileChooserErrorResponse) => void) {
    let options_: IFileChooserOptions = Object.assign({}, DefaultOptions, {
      name: GetGUID(10),
      clickable: false
    }, options);

    let inputEl = CreateInputEl(options_, resolve, reject);

    if (options_.targetEl) {
      options_.targetEl.appendChild(inputEl);
    }

    let off;
    if (options_.clickable) {
      off = On(options_.targetEl, 'click', undefined, function(e) {
        e.stopPropagation();
        trigger();
      });
    }

    let trigger = function() {
      inputEl.click();
    };

    let destory = function() {
      RemoveElement(inputEl);
      if (off) {
        off();
      }
    };

    return {
      actionSheet: this.actionSheet,
      trigger,
      destory
    };
  },
  actionSheet: null
};

function CreateInputEl(options: IFileChooserOptions, resolve?: (res: IFileChooserChangeResponse) => void, reject?: (error: IFileChooserErrorResponse) => void) {
  let inputEl = CreateElement('<input id="' + options.name + '" style="width:' + options.width + ';height:' + options.height + '" class="file-chooser-input" type="file" accept="image/*"' + (options.multiple ? ' multiple="multiple"' : '') + ((function() {
    if (BrowserPlatform.IOS || IsNullOrUndefined(options.capture)) {
      return '';
    }
    return ' capture="' + options.capture + '"';
  }))() + ' [readonly]="true"/>') as HTMLElement;

  On(inputEl, 'change', undefined, async function() {
    let validRes = ValidateFile(this.files, options);
    if (validRes) {
      reject(validRes);
    } else {
      // 压缩图片
      await CompressImage(this.files, options).then(function(files) {
        resolve({
          data: options.data,
          files
        });
      }).catch(function(error: IFileChooserErrorResponse) {
        reject(error);
      });
    }
    // ResetInputFile(this);
  });

  On(inputEl, 'click', undefined, function(e) {
    e.stopPropagation();
  });

  return inputEl;
}
