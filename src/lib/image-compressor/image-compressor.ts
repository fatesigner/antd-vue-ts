/**
 * image-compressor
 */

import { ICompressImage, ICompressImageOptions, ICompressImageResponse } from './interfaces';

const DefaultOptions: ICompressImageOptions = {
  quality: 0.6
};

/**
 * 压缩图片
 * @param file
 * @param options
 * @constructor
 */
export const CompressImage: ICompressImage = function (
  file: Blob,
  options: ICompressImageOptions
): Promise<ICompressImageResponse> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve, reject) {
    const options_: ICompressImageOptions = Object.assign({}, DefaultOptions, options);
    if (!(window as any).lrz) {
      await import('./lib/localResizeIMG/dist/lrz.bundle.js');
    }
    (window as any)
      .lrz(file, {
        quality: options_.quality
      })
      .then(function (res) {
        const res_: ICompressImageResponse = {
          formData: res.formData,
          file: res.file,
          fileLen: res.fileLen,
          base64: res.base64,
          base64Len: res.base64Len,
          origin: res.origin
        };
        resolve(res_);
      })
      .catch(function (error) {
        // console.log('lrz error：' + error);
        reject(new Error(JSON.stringify(error)));
      });
  });
};
