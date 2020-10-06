/**
 * ckeditor
 */

// import styles
import 'quill/dist/quill.core.css';
// for snow theme
import 'quill/dist/quill.snow.css';

import { QiniuService } from '../../../lib/qiniu';
import { RegisterUploadHandler } from '../../../lib/antdv-ui/components/rich-editor';

// 注册上传事件
RegisterUploadHandler(function (file) {
  return new Promise((resolve) => {
    QiniuService.uploadPublic(file, 1).then((x) => {
      resolve(x.url);
    });
  });
});

export function GetDefaultOptions() {
  return {
    modules: {
      toolbar: [['bold', 'italic', 'underline', 'strike']]
    },
    theme: 'snow'
  };
}
