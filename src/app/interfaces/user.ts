/**
 * user
 */

import { IMenu } from './menu';

export interface IUser<TRole extends readonly string[]> {
  username: string;
  password?: string;
  id?: string;
  job: string;
  name: string;
  nickname: string;
  phone: string;
  // 用户拥有的角色 可以有多个
  roles: TRole[number][];
  avatar?: string;
  realname?: string;
  // 用户可用的菜单
  menus: IMenu[];
  // 用户可访问的链接
  permissions?: string[];
  tokenType?: string;
  accessToken?: string;
  accessTokenFull?: string;
  refreshToken?: string;
  tokenExpirationTime?: number;
}
