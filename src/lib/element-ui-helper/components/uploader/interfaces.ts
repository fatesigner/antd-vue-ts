/**
 * interfaces
 */

export enum IEleUploaderContentType {
  image = 'application/image',
  pdf = 'application/pdf'
}

export interface IEleUploaderFile {
  key: string;
  data?: any;
  value: string;
  src: string;
  file: File | Blob;
  type: IEleUploaderContentType;
  uploading: boolean;
  error: {
    visible: boolean;
    message: string;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface IEleUploaderActionParams {
  index: number;
  file: File | Blob;
  src: string;
  data?: any;
}

export interface IEleUploaderOptions {
  files?: IEleUploaderFile[];
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
