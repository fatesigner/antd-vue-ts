/**
 * photoswipe
 */

import { AddEventListener, Closest, RemoveEventListener } from '@forgleaner/utils/document';
import { IsFunction } from '@forgleaner/utils/type-check';

import PhotoSwipeUI_Default from './lib/dist/photoswipe-ui-default.js';
import PhotoSwipe from './lib/dist/photoswipe.js';

import './photoswipe.scss';

import { IPhotoswipeBaseOptions, IPhotoswipeOptions, PhotoswipeBaseOptions, PhotoswipeOptions } from './interfaces';

let template: Element = document.getElementById('photoSwipeTemplate');
let templateStr;
if (!template) {
  templateStr = require('!!raw-loader!./photoswipe.html').default;
  const el = document.createElement('div');
  el.innerHTML = templateStr;
  template = el.children[0];
  document.getElementsByTagName('body')[0].appendChild(template);
}

export class Photoswipe {
  options: IPhotoswipeOptions;

  baseOpts: IPhotoswipeBaseOptions;

  onHandlerElClick: any;

  onBodyClick: any;

  private instance: any;

  constructor(opts: IPhotoswipeOptions, baseOpts?: IPhotoswipeBaseOptions) {
    this.options = new PhotoswipeOptions(opts);

    this.baseOpts = new PhotoswipeBaseOptions(baseOpts);

    if (this.options.handlerEl) {
      // 监听 handlerEl click 事件
      this.onHandlerElClick = (e: any) => {
        const target = Closest(e.target, this.options.itemSelector);
        if (target) {
          this.itemClick(target);
        }
      };
      AddEventListener(this.options.handlerEl, 'click', this.onHandlerElClick);
    } else {
      this.createInstance(this.options.items, this.options.index);
    }

    // 绑定 body click 事件 以解决关闭异常的问题
    this.onBodyClick = (e: any) => {
      const target = Closest(e.target, '.pswp', true);
      if (target && target.getAttribute('aria-hidden') === 'true' && target.classList.length > 1) {
        target.classList = 'pswp';
      }
    };
    AddEventListener(document.body, 'click', this.onBodyClick);
  }

  private createInstance(data, index) {
    if (this.instance) {
      this.instance.close();
    }

    const opts: any = {
      index: index,
      loop: this.baseOpts.loop,
      history: this.baseOpts.history,
      focus: this.baseOpts.focus,
      mainClass: this.baseOpts.mainClass,
      barsSize: this.baseOpts.barsSize,
      captionEl: this.baseOpts.captionEl,
      fullscreenEl: this.baseOpts.fullscreenEl,
      shareEl: this.baseOpts.shareEl,
      bgOpacity: this.baseOpts.bgOpacity,
      tapToClose: this.baseOpts.tapToClose,
      tapToToggleControls: this.baseOpts.tapToToggleControls
    };

    if (this.options.handlerEl) {
      opts.getThumbBoundsFn = (index) => {
        const thumbnail = data[index].el;
        const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        const rect = thumbnail.getBoundingClientRect();
        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      };
    }

    // 实例化
    this.instance = new PhotoSwipe(template, PhotoSwipeUI_Default, data, opts);

    this.instance.listen('close', () => {
      if (IsFunction(this.options.onDismiss)) {
        this.options.onDismiss();
      }
    });

    this.instance.init();
  }

  close() {
    if (this.instance) {
      this.instance.close();
    }
  }

  destroy() {
    if (this.onHandlerElClick) {
      RemoveEventListener(this.options.handlerEl, 'click', this.onHandlerElClick);
    }
    if (this.onBodyClick) {
      RemoveEventListener(document.body, 'click', this.onBodyClick);
    }
    if (this.instance) {
      this.instance.destroy();
      this.instance = undefined;
    }
  }

  private itemClick(target: Element) {
    // 处理数据
    const $items = this.options.handlerEl.querySelectorAll(this.options.itemSelector);

    if (!$items.length) {
      return;
    }

    const data = [];
    let el;
    let size;
    let index_ = -1;

    for (let i = 0, l = $items.length; i < l; i++) {
      el = $items[i];
      size = el.getAttribute('data-size-original').split('x');
      data.push({
        el: el.querySelector(this.options.imgSelector || 'img'),
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10),
        title: el.getAttribute('data-title') || '',
        src: el.getAttribute('data-src-original'),
        msrc: el.getAttribute('data-src-mini')
      });
      if (index_ === -1 && el == target) {
        index_ = i;
      }
    }

    this.createInstance(data, index_);

    this.instance.init();

    if (IsFunction(this.options.onPresent)) {
      this.options.onPresent();
    }
  }
}
