/**
 * qiniu 上传服务
 */

import { QiniuServiceInjector } from '../../lib/qiniu';

import { SessionService } from '../services/session.service';

// 为 qiniu 上传服务设置 baseUrl
QiniuServiceInjector({
  baseUrl: '/salesSystem',
  getAccessToken() {
    return SessionService.user.accessToken;
  }
});
