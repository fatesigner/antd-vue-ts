/**
 * model
 */

export enum IUploaderContentType {
  image = 'application/image',
  pdf = 'application/pdf'
}

export interface IUploaderFile {
  key: string;
  data?: any;
  value: string;
  src: string;
  blob: File | Blob;
  type: IUploaderContentType;
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

export interface IUploaderActionParams {
  index: number;
  blob: File | Blob;
  src: string;
  data?: any;
}
