/**
 * dateformat
 * 格式化日期字符串，使用 dayjs 处理
 */

import dayjs from 'dayjs';

export const DateFormatPipeKey = 'DateFormat';

export function DateFormatPipe(value, format = 'YYYY-MM-DD HH:mm:ss') {
  if (value) {
    return dayjs(value).format(format);
  }
  return value;
}
