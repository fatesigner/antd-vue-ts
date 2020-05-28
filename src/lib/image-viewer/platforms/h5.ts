/**
 * h5
 */

import { GetGUID } from '@forgleaner/utils/random';
import { IsFunction } from '@forgleaner/utils/type-check';

import PhotoSwipe from '../lib/photoswipe/dist/photoswipe';
import PhotoSwipeUI_Default from '../lib/photoswipe/dist/photoswipe-ui-default';

import '../lib/photoswipe/dist/default-skin/default-skin.scss';
import '../lib/photoswipe/src/css/main.scss';

import { PhotoswipeBaseOptions } from '../photoswipe/photoswipe.type';

import { DefaultOptions } from '../image-viewer.default';
import { IPreviewImage, IPreviewImageOptions } from '../model';

let template: Element = document.getElementById('photoSwipeTemplate');
let templateStr;
if (!template) {
  templateStr = require('../photoswipe/photoswipe.html');
  let el = document.createElement('div');
  el.innerHTML = templateStr;
  template = el.children[0];
  document.getElementsByTagName('body')[0].appendChild(template);
}

export const PreviewImage: IPreviewImage = function(options?: IPreviewImageOptions) {
  return new Promise((resolve) => {
    let options_: IPreviewImageOptions = Object.assign({}, DefaultOptions, {
      name: GetGUID(10),
      clickable: false
    }, options);

    let baseOpts = new PhotoswipeBaseOptions({});

    let psItems = [];

    for (let i = 0, l = options_.items.length; i < l; i++) {
      let item = options_.items[i];
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
    let instince: any = new PhotoSwipe(template, PhotoSwipeUI_Default, psItems, {
      index: options_.index,
      galleryUID: '1',
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

    instince.listen('close', () => {
      if (IsFunction(options_.onDismiss)) {
        options_.onDismiss();
      }
    });

    instince.init();

    if (IsFunction(options_.onPresent)) {
      options_.onPresent();
    }

    resolve({
      dismiss: () => {
        return new Promise(async (resolve2) => {
          if (instince) {
            instince.close();
          }
          window.setTimeout(function() {
            resolve2();
          }, 300);
        });
      }
    });
  });
};
