/**
 * timeAgoPipe
 */

export const TimeAgoPipeKey = 'TimeAgo';

export function TimeAgoPipe(value: number, type: 'day' | 'hour' | 'minute' | 'second'): string {
  if (value) {
    const timeDiff = new Date().getTime() - new Date(value).getTime();
    if (type === 'day') {
      // 计算出相差天数
      return Math.ceil(timeDiff / (24 * 60 * 60 * 1000)).toString();
    } else if (type === 'hour') {
      // 计算出相差小时数
      return Math.ceil(timeDiff / (60 * 60 * 1000)).toString();
    } else if (type === 'minute') {
      // 计算出相差秒数
      return Math.ceil(timeDiff / (60 * 1000)).toString();
    } else if (type === 'second') {
      // 计算出相差秒数
      return Math.ceil(timeDiff / 1000).toString();
    }
  }

  return '';
}

/**
 * 对指定的一个时间格式化为 具体的 天 时 分 秒
 * @param value
 * @constructor
 */
export function TimeFormatPipe(value: number) {
  let str = '';

  /* const days = Math.floor(value / (24 * 60 * 60 * 1000));
  if (days > 0) {
    str += `${days.toFixed()}天`;
  } */

  const hours = Math.floor(value / (60 * 60 * 1000));
  if (hours > 0) {
    str += `${hours.toFixed()}时`;
  }

  const minutes = Math.floor(((value % (60 * 60 * 1000)) % (60 * 60 * 1000)) / (60 * 1000));
  if (minutes > 0) {
    str += `${minutes.toFixed()}分`;
  }

  const seconds = Math.floor((((value % (60 * 60 * 1000)) % (60 * 60 * 1000)) % (60 * 1000)) / 1000);
  if (seconds > 0) {
    str += `${seconds.toFixed()}秒`;
  }

  return str || '0秒';
}
