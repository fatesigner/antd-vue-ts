/**
 * dateformat
 * 格式化日期字符串，使用 momment 处理
 */

import moment from 'moment';

export const DateFormatPipeKey = 'DateFormat';

export function DateFormatPipe(value: any, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (value) {
    return moment(value).format(format);
  }
  return '';
}
