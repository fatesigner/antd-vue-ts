/**
 * asteriskMask
 */

export function VueAsteriskMask(_Vue, options) {
  _Vue.filter('asteriskMask', function (value: string, start = 0, end = 0) {
    if (!value) {
      return '';
    }
    const length = value.length;
    if (!start) {
      start = 0;
    }
    if (!end) {
      end = length;
    }
    const startStr = value.substr(0, start);
    const endStr = value.substr(end, value.length - 1);
    let c = '';
    if (length >= start) {
      for (; start < end; start++) {
        c += '*';
        if (start >= length - 1) {
          break;
        }
      }
    }
    return startStr + c + endStr;
  });
}
