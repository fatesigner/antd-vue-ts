/**
 * photoSwipe.type
 */

import { DeepExtend } from '@forgleaner/utils';

export interface IPhotoswipeOptions {
  /**
   * 需要代理的Dom
   */
  handlerEl: any;
  /**
   * item 选择器
   */
  itemSelector: string;
  /**
   * img 选择器
   */
  imgSelector?: string;
  /**
   * 显示 回调
   */
  onPresent?: () => void;
  /**
   * 隐藏 回调
   */
  onDismiss?: () => void;
}

export class PhotoswipeOptions implements IPhotoswipeOptions {
  handlerEl = undefined;
  itemSelector = '';
  imgSelector = '';
  onPresent = undefined;
  onDismiss = undefined;

  constructor(opts?: IPhotoswipeOptions) {
    if (opts) {
      DeepExtend(this, opts);
    }
  }
}

export interface IPhotoswipeBaseOptions {
  loop?: boolean;
  history?: boolean;
  focus?: boolean;
  mainClass?: string;
  barsSize?: { top: number; bottom: number };
  captionEl?: boolean;
  fullscreenEl?: boolean;
  shareEl?: boolean;
  bgOpacity?: number;
  tapToClose?: boolean;
  tapToToggleControls?: boolean;
}

export class PhotoswipeBaseOptions implements IPhotoswipeBaseOptions {
  loop = true;
  history = false;
  focus = false;
  mainClass = 'pswp--minimal--dark';
  barsSize = { top: 0, bottom: 0 };

  // Buttons/elements
  closeEl = true;
  captionEl = true;
  fullscreenEl = true;
  zoomEl = true;
  shareEl = false;
  counterEl = true;
  arrowEl = true;
  preloaderEl = true;

  bgOpacity = 0.7;
  tapToClose = true;
  tapToToggleControls = false;

  constructor(opts?: IPhotoswipeBaseOptions) {
    if (opts) {
      DeepExtend(this, opts);
    }
  }
}
