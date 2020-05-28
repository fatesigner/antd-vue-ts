/**
 * interfaces
 */

export interface IQiniuProvider {
  baseUrl: string;
  getAccessToken: () => string;
}
