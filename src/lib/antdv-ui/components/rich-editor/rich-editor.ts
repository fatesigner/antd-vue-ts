/**
 * rich-editor
 */

type IUploadHandler = (file: File) => Promise<string>;

let promises = [];

let uploadHandler: IUploadHandler;

const UploadHandler: IUploadHandler = function (file) {
  if (uploadHandler) {
    return uploadHandler(file);
  }
  // 注册未完成前，返回一个挂起的 promise 操作
  return new Promise((resolve, reject) => {
    promises.push([resolve, reject, file]);
  });
};

/**
 * 注册 upload handler
 * @param handler
 * @constructor
 */
export function RegisterUploadHandler(handler: IUploadHandler) {
  uploadHandler = handler;
  // 注册完成后，判断是否有挂起的 promise
  if (promises.length) {
    // 执行 handler，完成未完成的 promise
    promises.forEach((promise) => {
      handler(promise.file)
        .then((res) => {
          promise.resolve(res);
        })
        .catch((error) => {
          promise.reject(error);
        });
    });
    promises = [];
  }
}

export { UploadHandler };
