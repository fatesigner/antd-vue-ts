/**
 * h5
 */

import { GetGUID } from '@forgleaner/utils/random';
import { BrowserPlatform } from '@forgleaner/utils/user-agent';
import { IsNullOrUndefined } from '@forgleaner/utils/type-check';
import { AddEventListener, CreateElement, On, RemoveElement } from '@forgleaner/utils/document';

import { CompressImage, DefaultOptions, ValidateFile } from '../file-chooser';
import {
  IFileChooserChangeResponse,
  IFileChooserErrorResponse,
  IFileChooserOptions,
  IFileChooserService
} from '../interfaces';

function CreateInputEl(
  options: IFileChooserOptions,
  resolve?: (res: IFileChooserChangeResponse) => void,
  reject?: (error: IFileChooserErrorResponse) => void
) {
  const inputEl = CreateElement(
    '<input id="' +
      options.name +
      '" style="width:' +
      options.width +
      ';height:' +
      options.height +
      '" class="file-chooser-input" type="file" accept="image/*"' +
      (options.multiple ? ' multiple="multiple"' : '') +
      (function () {
        if (BrowserPlatform.IOS || IsNullOrUndefined(options.capture)) {
          return '';
        }
        return ' capture="' + options.capture + '"';
      })() +
      ' [readonly]="true"/>'
  ) as HTMLElement;

  AddEventListener(inputEl, 'change', async function () {
    const validRes = ValidateFile(this.files, options);
    if (validRes) {
      reject(validRes);
    } else {
      // 压缩图片
      await CompressImage(this.files, options)
        .then(function (files) {
          resolve({
            data: options.data,
            files
          });
        })
        .catch(function (error: IFileChooserErrorResponse) {
          reject(error);
        });
    }
    // ResetInputFile(this);
  });

  AddEventListener(inputEl, 'click', function (e) {
    e.stopPropagation();
  });

  return inputEl;
}

export const FileChooserService: IFileChooserService = {
  openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      const options_: IFileChooserOptions = Object.assign(
        {},
        DefaultOptions,
        {
          name: GetGUID(10),
          clickable: false
        },
        options
      );

      const inputEl = CreateInputEl(options_, resolve, reject);

      if (options_.targetEl) {
        options_.targetEl.appendChild(inputEl);
        if (options_.clickable) {
          AddEventListener(options_.targetEl, 'click', function (e) {
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
  createFileChooser(
    options?: IFileChooserOptions,
    resolve?: (res: IFileChooserChangeResponse) => void,
    reject?: (error: IFileChooserErrorResponse) => void
  ) {
    const options_: IFileChooserOptions = Object.assign(
      {},
      DefaultOptions,
      {
        name: GetGUID(10),
        clickable: false
      },
      options
    );

    const inputEl = CreateInputEl(options_, resolve, reject);

    const trigger = function () {
      inputEl.click();
    };

    if (options_.targetEl) {
      options_.targetEl.appendChild(inputEl);
    }

    let off;
    if (options_.clickable) {
      off = AddEventListener(options_.targetEl, 'click', function (e) {
        e.stopPropagation();
        trigger();
      });
    }

    const destroy = function () {
      RemoveElement(inputEl);
      if (off) {
        off();
      }
    };

    return {
      actionSheet: this.actionSheet,
      trigger,
      destroy
    };
  },
  actionSheet: null
};
