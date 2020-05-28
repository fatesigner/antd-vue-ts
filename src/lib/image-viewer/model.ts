/**
 * model
 */

export interface IPreviewImageOptions {
  /**
   * 当前显示图片的 http 链接
   */
  index: number;

  /**
   * 需要预览的图片 http 链接列表
   */
  items: IPreviewImageImageData[];
  /**
   * 显示 回调
   */
  onPresent?: () => void;
  /**
   * 隐藏 回调
   */
  onDismiss?: () => void;
}

export interface IPreviewImageImageData {
  title?: string;
  src?: string;
  width: number;
  height: number;
  microSrc?: string;
  miniSrc?: string;
}

export interface IPreviewImageResponse {
  dismiss: () => Promise<void>;
}

export type IPreviewImage = (options: IPreviewImageOptions) => Promise<IPreviewImageResponse>;
