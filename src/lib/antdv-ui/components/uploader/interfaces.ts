/**
 * interfaces
 */

export enum IAsUploaderContentType {
  image = 'application/image',
  pdf = 'application/pdf'
}

export interface IAsUploaderFile {
  src: string;
  file: File;
  size: {
    width: number;
    height: number;
  };
  data?: any;
}

export interface IAsUploaderActionParams {
  index: number;
  file: File;
  src: string;
  data?: any;
}

export interface IAsUploaderOptions {
  files?: IAsUploaderFile[];
  action?: () => Promise<any>;
  data?: any;
  immediate?: boolean;
  multiple?: boolean;
  parallel?: boolean;
  required?: boolean;
  deletable?: boolean;
  maxCount?: number;
  maxSize?: number;
  width?: number;
}
