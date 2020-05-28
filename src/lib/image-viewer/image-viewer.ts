/**
 * 图片浏览器
 * 基于 photoswipe、微信jssdk
 */

import { BrowserClient } from '@forgleaner/utils/user-agent';

import { IPreviewImage, IPreviewImageOptions } from './model';

export const PreviewImage: IPreviewImage = function (options?: IPreviewImageOptions) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    // 判断所处平台
    if (BrowserClient.Wechat) {
      const _ = await import('./platforms/h5');
      // let _ = await import('./platforms/wechat');
      resolve(_.PreviewImage(options));
    } else {
      const _ = await import('./platforms/h5');
      resolve(_.PreviewImage(options));
    }
  });
};
