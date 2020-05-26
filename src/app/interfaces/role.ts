/**
 *  用户角色权限配置
 *  可以根据实际业务设置
 */

export type IRoles<T extends readonly string[]> = {
  value: T[number];
  text: string;
  testAccount: {
    username: string;
    password: string;
  };
}[];
