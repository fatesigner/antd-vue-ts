/**
 * wechat
 */

import { ChooseImage, GetLocalImgData } from '../../wx-jssdk';

import { DefaultOptions } from '../file-chooser';
import { IFileChooserChangeResponse, IFileChooserErrorResponse, IFileChooserErrorType, IFileChooserOptions, IFileChooserService } from '../model';
import { GetGUID } from '@forgleaner/utils/random';
import { ConvertBase64ToBlob, ConvertBlobToFile } from '@forgleaner/utils';
import { On } from '@forgleaner/utils/document';

export const FileChooserServiceWechat: IFileChooserService = {
  openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      let options_: IFileChooserOptions = Object.assign(DefaultOptions, {
        name: GetGUID(10)
      }, options);
      ChooseImage({
        count: 5, // 默认 9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
      }).then(async (res) => {
        // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        let localIds = res.localIds;
        let files: File[] = [];
        try {
          for (let localId of localIds) {
            localId = localId.toString();
            let res2 = await GetLocalImgData({
              localId
            });
            let blob = ConvertBase64ToBlob(res2.localData);
            let file = ConvertBlobToFile(blob, '', '');
            files.push(file);
          }
          resolve({
            data: options_.data,
            files
          });
        } catch (error) {
          let reason: IFileChooserErrorResponse = {
            type: IFileChooserErrorType.Other,
            message: error.errMsg
          };
          reject(reason);
        }
      }).catch((error) => {
        if (error.errMsg) {
          let reason: IFileChooserErrorResponse = {
            type: IFileChooserErrorType.Other,
            message: error.errMsg
          };
          reject(reason);
        }
      });
    });
  },
  createFileChooser(options?: IFileChooserOptions, resolve?: (res: IFileChooserChangeResponse) => void, reject?: (error: IFileChooserErrorResponse) => void) {
    let options_: IFileChooserOptions = Object.assign({}, DefaultOptions, {
      name: GetGUID(10),
      clickable: false
    }, options);
    let trigger = () => {
      this.openFileChooser(options_).then(function(res) {
        if (resolve) {
          resolve(res);
        }
      }, function(error) {
        if (reject) {
          reject(error);
        }
      });
    };

    let off;
    if (options_.clickable) {
      off = On(options_.targetEl, 'click', undefined, function(e) {
        e.stopPropagation();
        trigger();
      });
    }

    let destory = function() {
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
