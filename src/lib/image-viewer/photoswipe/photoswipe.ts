/**
 * photoswipe
 */

import { Closest } from '../../utils/document';
import { AddEventListener, RemoveEventListener } from '../../utils/event';
import { IsFunction } from '../../utils/typeCheck';

import PhotoSwipeUI_Default from '../lib/photoswipe/dist/photoswipe-ui-default.js';
import PhotoSwipe from '../lib/photoswipe/dist/photoswipe.js';

import './photoswipe.scss';

import { IPhotoswipeBaseOptions, IPhotoswipeOptions, PhotoswipeBaseOptions, PhotoswipeOptions } from './photoswipe.type';

let template: Element = document.getElementById('photoSwipeTemplate');
let templateStr;
if (!template) {
  templateStr = require('./photoswipe.html');
  let el = document.createElement('div');
  el.innerHTML = templateStr;
  template = el.children[0];
  document.getElementsByTagName('body')[0].appendChild(template);
}

export class Photoswipe {

  options: IPhotoswipeOptions;

  baseOpts: IPhotoswipeBaseOptions;

  onHandlerElClick: any;

  onBodyClick: any;

  private instince: any;

  constructor(opts: IPhotoswipeOptions, baseOpts?: IPhotoswipeBaseOptions) {

    this.options = new PhotoswipeOptions(opts);

    this.baseOpts = new PhotoswipeBaseOptions(baseOpts);

    // 监听 handlerEl click 事件
    this.onHandlerElClick = (e: any) => {
      let target = Closest(e.target, this.options.itemSelector);
      if (target) {
        this.itemClick(target);
      }
    };
    AddEventListener(this.options.handlerEl, 'click', this.onHandlerElClick);

    // 绑定 body click 事件 以解决关闭异常的问题
    this.onBodyClick = (e: any) => {
      let target = Closest(e.target, '.pswp', true);
      if (target && target.getAttribute('aria-hidden') === 'true' && target.classList.length > 1) {
        target.classList = 'pswp';
      }
    };
    AddEventListener(document.body, 'click', this.onBodyClick);
  }

  close() {
    if (this.instince) {
      this.instince.close();
    }
  }

  destroy() {
    if (this.onHandlerElClick) {
      RemoveEventListener(this.options.handlerEl, 'click', this.onHandlerElClick);
    }
    if (this.onBodyClick) {
      RemoveEventListener(document.body, 'click', this.onBodyClick);
    }
    if (this.instince) {
      this.instince.destroy();
      this.instince = undefined;
    }
  }

  private itemClick(target: Element) {
    // 处理数据
    let $items = this.options.handlerEl.querySelectorAll(this.options.itemSelector);

    if (!$items.length) {
      return;
    }

    let data = [];
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

    if (this.instince) {
      this.instince.close();
    }

    // 实例化
    this.instince = new PhotoSwipe(template, PhotoSwipeUI_Default, data, {
      index: index_,
      getThumbBoundsFn(index) {
        let thumbnail = data[index].el;
        let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        let rect = thumbnail.getBoundingClientRect();
        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      },
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
    });

    this.instince.listen('close', () => {
      if (IsFunction(this.options.onDismiss)) {
        this.options.onDismiss();
      }
    });

    this.instince.init();

    if (IsFunction(this.options.onPresent)) {
      this.options.onPresent();
    }
  }
}
