/**
 * wechat
 */

import { ForEach } from '@forgleaner/utils';
import { GetGUID } from '@forgleaner/utils/random';

import { PreviewImage as PreviewImage_Wx } from '../../wx-jssdk';

import { DefaultOptions } from '../default';
import { IPreviewImage, IPreviewImageOptions } from '../interfaces';

export const PreviewImage: IPreviewImage = function (options?: IPreviewImageOptions) {
  return new Promise((resolve) => {
    const options_: IPreviewImageOptions = Object.assign(
      {},
      DefaultOptions,
      {
        name: GetGUID(10),
        clickable: false
      },
      options
    );
    let current = '';
    const urls = [];
    ForEach(
      options.items,
      (prev, cur, i: number) => {
        prev.push(cur.src);
        if (options.index === i) {
          current = cur.src;
        }
        return prev;
      },
      []
    );
    PreviewImage_Wx({
      current,
      urls
    });
    resolve({
      dismiss: () => {
        // eslint-disable-next-line promise/param-names,no-async-promise-executor
        return new Promise(async (resolve2) => {
          window.setTimeout(function () {
            resolve2();
          }, 300);
        });
      }
    });
  });
};
