/**
 * global
 * 全局变量
 */

import { ConvertModelArrToEnum } from '@fatesigner/utils';

import { IENV } from './interfaces/env';

// 映射环境变量
export const ENV: IENV = {
  VUE_APP_KEY: process.env.VUE_APP_KEY,
  VUE_APP_NAME: process.env.VUE_APP_NAME,
  VUE_APP_TITLE: process.env.VUE_APP_TITLE,
  VUE_APP_WEBHOST: process.env.VUE_APP_WEBHOST,
  VUE_APP_APIHOST: process.env.VUE_APP_APIHOST
};

// 定义可用的 ApiHost 集合，用于动态切换服务端环境
export const ApiHostCollection = ConvertModelArrToEnum([
  // 开发环境
  {
    name: 'development',
    value: `${ENV.VUE_APP_APIHOST}/develop`,
    text: '开发'
  },
  // 测试环境
  {
    name: 'test',
    value: `${ENV.VUE_APP_APIHOST}/test`,
    text: '测试'
  },
  // 生产环境
  {
    name: 'production',
    value: `${ENV.VUE_APP_APIHOST}`,
    text: '生产'
  }
]);

// 用户角色
export const RoleCollection = ConvertModelArrToEnum([
  // 管理员
  {
    name: 'admin',
    value: 'admin',
    text: '管理员',
    account: {
      username: 'admin',
      password: '123456'
    }
  },
  // 用户
  {
    name: 'normal',
    value: 'normal',
    text: '用户',
    account: {
      username: 'normal',
      password: '123456'
    }
  }
]);

// 定义排序方式
export const SortCollection = ConvertModelArrToEnum([
  {
    value: 1,
    text: '最新排序',
    name: 'latest'
  },
  {
    value: 2,
    text: '从低到高',
    name: 'ASC'
  },
  {
    value: 3,
    text: '从高到底',
    name: 'DESC'
  }
]);
