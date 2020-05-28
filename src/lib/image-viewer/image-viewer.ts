/**
 * 图片浏览器
 * 基于 photoswipe、微信 jssdk
 */

import { BrowserClient } from '@forgleaner/utils/user-agent';

import { IPreviewImage, IPreviewImageOptions } from './interfaces';

export const PreviewImage: IPreviewImage = function (options?: IPreviewImageOptions) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    // 判断所处平台
    if (BrowserClient.Wechat) {
      import('./platforms/h5').then((_) => {
        resolve(_.PreviewImage(options));
      });
    } else {
      import('./platforms/h5').then((_) => {
        resolve(_.PreviewImage(options));
      });
    }
  });
};
