/**
 * file-chooser
 */

import { FilterExtensions, GetContentSize } from '@forgleaner/utils/document';
import { ConvertToBytesUnit } from '@forgleaner/utils';

import { CompressImage as CompressorImage } from '../image-compressor';

import {
  Capture,
  FileChooserConfig,
  IFileChooserActionSheet,
  IFileChooserChangeResponse,
  IFileChooserErrorResponse,
  IFileChooserErrorType,
  IFileChooserOptions,
  IFileChooserService
} from './model';

import './file-chooser.scss';

export * from './model';

export const DefaultOptions: IFileChooserOptions = {
  width: '100%',
  height: '100%',
  multiple: false,
  count: 1,
  fileTypeLimits: [],
  minSize: 0,
  accept: '',
  capture: Capture.Camera,
  compress: {
    quality: 0.8
  },
  clickable: true
};

const error = new Error(
  "It seems like you haven't injected dependencies yet, Please execute the function FileChooserInjector first."
);

class FileChooserCreator implements IFileChooserService {
  actionSheet: IFileChooserActionSheet = null;

  openFileChooser(options?: IFileChooserOptions) {
    throw error;
    return new Promise<IFileChooserChangeResponse>(function (resolve) {
      resolve();
    });
  }

  createFileChooser(
    options?: IFileChooserOptions,
    resolve?: (res: IFileChooserChangeResponse) => void,
    reject?: (error: IFileChooserErrorResponse) => void
  ) {
    throw error;
    return {
      actionSheet: this.actionSheet,
      trigger: null,
      destory: null
    };
  }
}

const FileChooserService = new FileChooserCreator();

export function FileChooserInjector(config: FileChooserConfig) {
  FileChooserService.openFileChooser = config.core.openFileChooser;
  FileChooserService.createFileChooser = config.core.createFileChooser;
  if (config && config.actionSheet) {
    FileChooserService.actionSheet = config.actionSheet;
  }
}

export { FileChooserService };

// 验证文件
export function ValidateFile(files: File[], options: IFileChooserOptions): IFileChooserErrorResponse {
  let validRes;
  if (options.multiple && files.length > options.count) {
    validRes = {
      type: IFileChooserErrorType.InvalidCount,
      message: '仅支持选择' + options.count + '个文件！'
    };
  }
  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i];
    if (!FilterExtensions(file, options.fileTypeLimits.join(','))) {
      validRes = {
        type: IFileChooserErrorType.InvalidType,
        message: '仅支持' + options.fileTypeLimits.join(',') + '的文件格式！'
      };
    }
    const fileSize = GetContentSize(file);
    if (options.minSize && fileSize < options.minSize * 1024) {
      validRes = {
        type: IFileChooserErrorType.InvalidSize,
        message: '最小支持' + ConvertToBytesUnit(options.minSize * 1024) + '的文件'
      };
    }
    if (options.maxSize && fileSize > options.maxSize * 1024) {
      validRes = {
        type: IFileChooserErrorType.InvalidSize,
        message: '最大支持' + ConvertToBytesUnit(options.maxSize * 1024) + '的文件'
      };
    }
    if (validRes) {
      break;
    }
  }
  return validRes;
}

export function CompressImage(files: File[], options: IFileChooserOptions): Promise<File[]> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const newFiles = [];
    for (const file of files) {
      const newFile = await CompressorImage(file, options.compress).catch(function (error) {
        const reason: IFileChooserErrorResponse = {
          type: IFileChooserErrorType.Compress,
          message: error.message
        };
        reject(reason);
      });
      if (newFile) {
        try {
          const f = new File([newFile.file], newFile.origin.name);
          newFiles.push(f);
        } catch (e) {
          const f: any = new Blob([newFile.file]);
          f.name = newFile.origin.name;
          f.lastModifiedDate = new Date();
          newFiles.push(f);
        }
      }
    }
    resolve(newFiles);
  });
}
