/**
 * model
 */

import { FileType } from '@forgleaner/utils/document';

import { ICompressImageOptions } from '../image-compressor';

export interface IFileChooserOptions {
  targetEl?: HTMLElement;
  name?: string;
  width?: string;
  height?: string;
  multiple?: boolean;
  count?: number;
  /**
   * @description fileTypeLimits
   */
  fileTypeLimits?: FileType[];
  /**
   * 限制文件最大尺寸，单位 KB
   */
  minSize?: number;
  /**
   * 限制文件最大尺寸，单位 KB
   */
  maxSize?: number;
  accept?: string;
  capture?: Capture;
  data?: any;
  clickable?: boolean;
  trigger?: Function;
  compress?: ICompressImageOptions;
  actionSheet?: IFileChooserActionSheet;
}

export interface IFileChooserChangeResponse {
  data: any;
  files: File[];
}

export interface IFileChooserErrorResponse {
  type: IFileChooserErrorType;
  message: string;
}

export enum IFileChooserErrorType {
  Compress = 'Compress',
  InvalidCount = 'InvalidCount',
  InvalidSize = 'InvalidSize',
  InvalidType = 'InvalidType',
  Other = 'Other'
}

export interface IFileChooser {
  actionSheet: IFileChooserActionSheet;
  trigger: () => void;
  destory: () => void;
}

export interface IFileChooserService {
  openFileChooser: IOpenFileChooser;
  createFileChooser: ICreateFileChooser;
  actionSheet: IFileChooserActionSheet;
}

export type IOpenFileChooser = (
  this: IFileChooser,
  options?: IFileChooserOptions
) => Promise<IFileChooserChangeResponse>;

export type ICreateFileChooser = (
  options?: IFileChooserOptions,
  resolve?: (res: IFileChooserChangeResponse) => void,
  reject?: (error: IFileChooserErrorResponse) => void
) => IFileChooser;

export type IFileChooserActionSheet = (buttons: { text: string; handler: () => void }[]) => void;

/**
 * FileChooser配置
 */
export interface IFileChooserConfig {
  core: IFileChooserService;
  actionSheet: IFileChooserActionSheet;
}

export class FileChooserConfig implements IFileChooserConfig {
  core: IFileChooserService;
  actionSheet: IFileChooserActionSheet;
}

export enum Capture {
  Camera = 'camera',
  Camcorder = 'camcorder'
}
