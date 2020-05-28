/**
 * h5
 */

import { GetGUID } from '@forgleaner/utils/random';
import { IsFunction } from '@forgleaner/utils/type-check';

import { DefaultOptions } from '../default';
import { IPreviewImage, IPreviewImageOptions } from '../interfaces';
import { PhotoswipeBaseOptions, Photoswipe } from '../photoswipe';

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

    const baseOpts = new PhotoswipeBaseOptions({});

    const psItems = [];

    for (let i = 0, l = options_.items.length; i < l; i++) {
      const item = options_.items[i];
      psItems.push({
        el: undefined,
        w: item.width,
        h: item.height,
        author: item.title || '',
        title: item.title || '',
        src: item.src || '',
        msrc: item.microSrc || ''
      });
    }

    // 实例化
    const _photoswipe: any = new Photoswipe({ items:  psItems, index: options_.index}, {
      loop: baseOpts.loop,
      history: baseOpts.history,
      focus: baseOpts.focus,
      mainClass: baseOpts.mainClass,
      barsSize: baseOpts.barsSize,
      captionEl: baseOpts.captionEl,
      fullscreenEl: baseOpts.fullscreenEl,
      shareEl: baseOpts.shareEl,
      bgOpacity: baseOpts.bgOpacity,
      tapToClose: baseOpts.tapToClose,
      tapToToggleControls: baseOpts.tapToToggleControls
    });

    _photoswipe.instance.listen('close', () => {
      if (IsFunction(options_.onDismiss)) {
        options_.onDismiss();
      }
    });

    _photoswipe.instance.init();

    if (IsFunction(options_.onPresent)) {
      options_.onPresent();
    }

    resolve({
      dismiss: () => {
        // eslint-disable-next-line no-async-promise-executor,promise/param-names
        return new Promise(async (resolve2) => {
          if (_photoswipe.instance) {
            _photoswipe.instance.close();
          }
          window.setTimeout(function () {
            resolve2();
          }, 300);
        });
      }
    });
  });
};
