/**
 * qiniu 图片上传服务
 * 1 图片，2 音频, 3 音频
 */

import Axios from 'axios';
import * as qiniu from 'qiniu-js';

import { IQiniuProvider } from './interfaces';

type OnUploadProgress = (progressEvent: any) => void;

let Provider: IQiniuProvider = {
  baseUrl: '',
  getAccessToken() {
    return '';
  }
};

const axios = Axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

axios.interceptors.request.use((req) => {
  req.headers['X-Access-Token'] = Provider.getAccessToken();
  return req;
});

axios.interceptors.response.use(
  (response: any) => {
    if (response.status === 200) {
      const res = response.data;
      if (res.code === 0 || res.code === 200) {
        return res.data || res.result;
      } else {
        return Promise.reject(new Error(res.msg || res.message || '请求错误！'));
      }
    } else {
      return Promise.reject(new Error(response.message || response));
    }
  },
  (err) => {
    if (err.response) {
      err = err.response;
      if (err.data) {
        err = err.data;
      }
    }
    return Promise.reject(new Error(err.message || err.msg || err));
  }
);

export function QiniuServiceInjector(provider: IQiniuProvider): void {
  Provider = provider;
  // axios.defaults.baseURL = provider.baseUrl;
}

function GetBaseUrl() {
  const typeStr = Object.prototype.toString.call(Provider.baseUrl);
  if (typeStr === '[object String]') {
    return Provider.baseUrl;
    // eslint-disable-next-line no-dupe-else-if
  } else if (typeStr === '[object Function]') {
    return (Provider.baseUrl as any)() ?? '';
  } else {
    return '';
  }
}

class QiniuServiceStatic {
  /**
   * 上传一个文件，到公共区间
   * @param {*} file
   * @param {*} mediaType
   * @param onUploadProgress
   */
  async uploadPublic(
    file: File,
    mediaType: number,
    onUploadProgress?: OnUploadProgress
  ): Promise<{
    key: string;
    mediaId: string;
    mediaKey: string;
    token: string;
    url: string;
    videoCover: string;
  }> {
    // 先获取 token
    const resToken: {
      key: string;
      mediaId: string;
      mediaKey: string;
      token: string;
      url: string;
      videoCover: string;
    } = await axios({
      url: GetBaseUrl() + '/qiniu/token?showPub=true',
      method: 'get'
    })
      .then((res: any) => {
        return res;
      })
      .catch((err) => {
        throw err;
      });

    // 拿到 token 后再上传文件
    if (resToken) {
      const resUpload: {
        fsize: number;
        key: string;
        persistentId: string;
        saveAsKey: string;
        saveAsVideoCover: string;
      } = await this.executeUpload(file, resToken.token, mediaType, onUploadProgress)
        .then((res: any) => {
          return res;
        })
        .catch((err) => {
          throw err;
        });

      if (resUpload) {
        const params = {
          key: resUpload.key,
          resouceName: file.name,
          size: file.size,
          showPub: true
        };

        return axios({
          method: 'get',
          url: GetBaseUrl() + '/qiniu/url',
          params
        }).then((res: any) => {
          return res;
        });
      }
    }
  }

  /**
   * 上传一个文件到私有加密空间
   * @param {*} file
   * @param {*} mediaType
   * @param onUploadProgress
   */
  async uploadPrivate(file: File, mediaType: number, onUploadProgress?: OnUploadProgress) {
    // 先获取 token
    const resToken: {
      data: {
        token: string;
        mediaId: string;
        mediaKey: string;
      };
    } = await axios({
      url: `${GetBaseUrl()}/qiniu/content/token?mediaType=${mediaType}`,
      method: 'get'
    }).catch((err) => {
      throw err;
    });

    // 拿到 token 后再上传文件
    if (resToken) {
      const resUpload: {
        data: {
          key: string;
        };
      } = await this.executeUpload(file, resToken.data.token, mediaType, onUploadProgress).catch((err) => {
        throw err;
      });

      if (resUpload) {
        const params = {
          key: resUpload.data.key,
          resouceName: file.name,
          size: file.size,
          mediaType,
          mediaId: resToken.data.mediaId,
          mediaKey: resToken.data.mediaKey
        };

        return axios({
          method: 'post',
          url: mediaType === 1 ? GetBaseUrl() + '/qiniu/content/illustration' : GetBaseUrl() + '/qiniu/content/media',
          data: params
        }).then((res: any) => {
          return res;
        });
      }
    }
  }

  private executeUpload(
    file: File,
    token: string,
    mediaType: number,
    onUploadProgress?: OnUploadProgress
  ): Promise<any> {
    const config = {
      useCdnDomain: false,
      region: qiniu.region.z2
    };
    const putExtra: any = {
      fname: file.name,
      params: {},
      mimeType: null
    };
    return new Promise((resolve, reject) => {
      qiniu.upload(file, null, token, putExtra, config).subscribe({
        next(res) {
          if (onUploadProgress) {
            onUploadProgress(res);
          }
        },
        error(err) {
          reject(err);
        },
        complete(uploadRes) {
          resolve(uploadRes);
        }
      });
    });
  }
}

export const QiniuService = new QiniuServiceStatic();
