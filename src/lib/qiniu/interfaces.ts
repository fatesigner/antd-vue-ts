/**
 * interfaces
 */

type getUrl = () => string;

export interface IQiniuProvider {
  baseUrl: string | getUrl;
  getAccessToken: () => string;
}
