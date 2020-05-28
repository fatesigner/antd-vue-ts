/**
 * interfaces
 */

import { Prop } from 'vue-property-decorator';

export enum IUploaderContentType {
  image = 'application/image',
  pdf = 'application/pdf'
}

export interface IUploaderFile {
  key: string;
  data?: any;
  value: string;
  src: string;
  file: File | Blob;
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
  file: File | Blob;
  src: string;
  data?: any;
}

export interface IUploaderOptions {
  files?: IUploaderFile[];
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
