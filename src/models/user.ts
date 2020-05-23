/**
 * user
 */

export interface IUser<T extends readonly string[]> {
  username: string;
  password?: string;
  // 用户拥有的角色 可以有多个
  roles: T[number][];
  avatar?: string;
  realname?: string;
  tokenType?: string;
  accessToken?: string;
  accessTokenFull?: string;
  refreshToken?: string;
  tokenExpirationTime?: number;
}
