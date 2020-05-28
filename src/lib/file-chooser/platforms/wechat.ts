/**
 * wechat
 */

import { ChooseImage, GetLocalImgData } from '../../wx-jssdk';

import { DefaultOptions } from '../file-chooser';
import {
  IFileChooserChangeResponse,
  IFileChooserErrorResponse,
  IFileChooserErrorType,
  IFileChooserOptions,
  IFileChooserService
} from '../model';
import { GetGUID } from '@forgleaner/utils/random';
import { ConvertBase64ToBlob, ConvertBlobToFile } from '@forgleaner/utils';
import { On } from '@forgleaner/utils/document';

export const FileChooserService: IFileChooserService = {
  openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      const options_: IFileChooserOptions = Object.assign(
        DefaultOptions,
        {
          name: GetGUID(10)
        },
        options
      );
      ChooseImage({
        count: 5, // 默认 9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
      })
        .then(async (res) => {
          // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          const localIds = res.localIds;
          const files: File[] = [];
          try {
            for (let localId of localIds) {
              localId = localId.toString();
              const res2 = await GetLocalImgData({
                localId
              });
              const blob = ConvertBase64ToBlob(res2.localData);
              const file = ConvertBlobToFile(blob, '', '');
              files.push(file);
            }
            resolve({
              data: options_.data,
              files
            });
          } catch (error) {
            const reason: IFileChooserErrorResponse = {
              type: IFileChooserErrorType.Other,
              message: error.errMsg
            };
            reject(reason);
          }
        })
        .catch((error) => {
          if (error.errMsg) {
            const reason: IFileChooserErrorResponse = {
              type: IFileChooserErrorType.Other,
              message: error.errMsg
            };
            reject(reason);
          }
        });
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
    const trigger = () => {
      this.openFileChooser(options_).then(
        function (res) {
          if (resolve) {
            resolve(res);
          }
        },
        function (error) {
          if (reject) {
            reject(error);
          }
        }
      );
    };

    let off;
    if (options_.clickable) {
      off = On(options_.targetEl, 'click', undefined, function (e) {
        e.stopPropagation();
        trigger();
      });
    }

    const destroy = function () {
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
