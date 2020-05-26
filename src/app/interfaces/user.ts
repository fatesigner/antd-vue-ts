/**
 * user
 */

export interface IUser<TRole extends readonly string[]> {
  username: string;
  password?: string;
  // 用户拥有的角色 可以有多个
  roles: TRole[number][];
  avatar?: string;
  realname?: string;
  tokenType?: string;
  accessToken?: string;
  accessTokenFull?: string;
  refreshToken?: string;
  tokenExpirationTime?: number;
}
