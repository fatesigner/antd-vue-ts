/**
 * wechat
 */

import { GetGUID } from '@forgleaner/utils/random';
import { IsFunction } from '@forgleaner/utils/type-check';
import { PreviewImage as PreviewImage_Wx } from '../../wx-jssdk';

import { DefaultOptions } from '../image-viewer.default';
import { IPreviewImage, IPreviewImageImageData, IPreviewImageOptions } from '../model';

export const PreviewImage: IPreviewImage = function(options?: IPreviewImageOptions) {
  return new Promise((resolve) => {
    let options_: IPreviewImageOptions = Extend({}, DefaultOptions, {
      name: GetGUID(10),
      clickable: false
    }, options);
    let current = '';
    let urls = [];
    ForEach<IPreviewImageImageData>(options.items, (value, i: number) => {
      urls.push(value.src);
      if (options.index === i) {
        current = value.src;
      }
      return true;
    });
    PreviewImage_Wx({
      current,
      urls
    });
    resolve({
      dismiss: () => {
        return new Promise(async (resolve2) => {
          window.setTimeout(function() {
            resolve2();
          }, 300);
        });
      }
    });
  });
};
