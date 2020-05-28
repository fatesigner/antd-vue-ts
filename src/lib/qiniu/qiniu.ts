/**
 * qiniu 图片上传服务
 * 1 图片，2 音频, 3 音频
 */

import Axios from 'axios';
import * as qiniu from 'qiniu-js';

import { IQiniuProvider } from './interfaces';

let Provider: IQiniuProvider = {
  baseUrl: '',
  getAccessToken() {
    return '';
  }
};

export function QiniuServiceInjector(provider: IQiniuProvider) {
  Provider = provider;
}

const _executeUpload = function (file, token, mediaType) {
  const config = {
    useCdnDomain: false,
    region: qiniu.region.z2
  };
  const _getMimeType = function (mediaType) {
    switch (mediaType) {
      // case 1: return ["image/png", "image/jpeg", "image/gif"]
      // case 2: return ["audio/mp3"]
      case 1:
        return ['image/*'];
      case 2:
        return ['audio/*'];
      default:
        return [];
    }
  };
  const putExtra = {
    fname: file.name,
    params: {},
    mimeType: null
  };
  return new Promise((resolve, reject) => {
    qiniu.upload(file, null, token, putExtra, config).subscribe({
      next(res) {},
      error(err) {
        reject(err);
      },
      complete(uploadRes) {
        resolve(uploadRes);
      }
    });
  });
};

let axios;

class QiniuServiceStatic {
  constructor() {
    axios = Axios.create({
      baseURL: Provider.baseUrl,
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
      (response) => {
        if (response.status === 200) {
          const res = response.data;
          if (res.code === 0 || res.code === 200) {
            return res.data || res.result;
          } else {
            return Promise.reject(res.msg || res.message || '请求错误！');
          }
        } else {
          return Promise.reject(response.message || response);
        }
      },
      (err) => {
        if (err.response) {
          err = err.response;
          if (err.data) {
            err = err.data;
          }
        }
        return Promise.reject(err.message || err.msg || err);
      }
    );
  }

  async uploadMutiple(lines, mediaType, handleFn = undefined) {
    // 全部成功才能成功：
    const reqs = [];
    lines.forEach((line, ind) => {
      reqs.push(
        this.uploadOne(line.file, mediaType).then((res) => {
          line.url = res.url;
          line.key = res.key;
          line.file = undefined;
          if (typeof handleFn === 'function') {
            return handleFn(res, line, ind, lines);
          }
        })
      );
    });
    await Promise.all(reqs);
  }

  async uploadPrivateMutiple(lines, mediaType, handleFn = undefined) {
    // 全部成功才能成功：
    const reqs = [];
    lines.forEach((line, ind) => {
      reqs.push(
        this.uploadPrivateOne(line.file, mediaType).then((res) => {
          line.url = res.url;
          line.key = res.key;
          line.file = undefined;
          if (typeof handleFn === 'function') {
            return handleFn(res, line, ind, lines);
          }
        })
      );
    });
    await Promise.all(reqs);
  }

  /**
   * 上传一个文件，到公共区间
   * @param {*} file
   * @param {*} mediaType
   */
  async uploadOne(file, mediaType) {
    const tokenRes = await axios({
      url: '/qiniu/token?showPub=true',
      method: 'get'
    });
    const uploadRes: any = await _executeUpload(file, tokenRes.token, mediaType);

    const params = {
      key: uploadRes.key,
      resouceName: file.name,
      size: file.size,
      showPub: true
    };

    return await axios({
      method: 'get',
      url: '/qiniu/url',
      params
    });
  }

  /**
   * 上传一个文件到私有加密空间
   * @param {*} file
   * @param {*} mediaType
   */
  async uploadPrivateOne(file, mediaType) {
    const tokenRes = await axios({
      url: `/qiniu/content/token?mediaType=${mediaType}`,
      method: 'get'
    });

    const uploadRes: any = await _executeUpload(file, tokenRes.token, mediaType);

    const params = {
      key: uploadRes.key,
      resouceName: file.name,
      size: file.size,
      mediaType,
      mediaId: tokenRes.mediaId,
      mediaKey: tokenRes.mediaKey
    };

    return await axios({
      method: 'post',
      url: mediaType === 1 ? '/qiniu/content/illustration' : `/qiniu/content/media`,
      data: params
    });
  }
}

export const QiniuService = new QiniuServiceStatic();
