/**
 * fetch
 * 使用 Axios
 * Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。
 *
 * 从浏览器中创建 XMLHttpRequests
 * 从 node.js 创建 http 请求
 * 支持 Promise API
 * 拦截请求和响应
 * 转换请求数据和响应数据
 * 取消请求
 * 自动转换 JSON 数据
 * 客户端支持防御 XSRF
 */

import Qs from 'qs';
import Axios from 'axios';

export enum ContentType {
  FormUrlEncoded = 'application/x-www-form-urlencoded;charset=UTF-8',
  FormData = 'multipart/form-data',
  JSON = 'application/json;charset=UTF-8',
  PDF = 'application/pdf'
}

// 接口地址
Axios.defaults.baseURL = '';

// 设置 default header
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Content-Type
Axios.defaults.headers.post['Content-Type'] = ContentType.JSON;

// 超时时间
Axios.defaults.timeout = 20000;

// 请求拦截: 为 POST 类型的传参序列化
Axios.interceptors.request.use(
  function (config) {
    if (config.method !== 'get' && config.headers['Content-Type'] === ContentType.FormUrlEncoded) {
      config.data = Qs.stringify(config.data);
    }
    return config;
  },
  function (error: Error) {
    return Promise.reject(error);
  }
);

export { Axios as Http };
