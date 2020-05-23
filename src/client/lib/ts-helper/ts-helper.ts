/**
 * vuex-storeg
 */

// 将指定的模型集合数据转换为枚举类型
export function ConvertModelArrToEnum(items, valueKey = 'value', textKey = 'text') {
  return items.reduce((prev, cur) => {
    prev[cur[valueKey]] = cur[textKey];
    return prev;
  }, {});
}

// 将指定的字符串数组转换为枚举类型
export function ConvertArrToEnum<T extends readonly string[]>(
  items: T,
  callback?: (item: string) => string
): {
  [key in T[number]]: T[number];
} {
  return items.reduce((prev, cur) => {
    if (callback) {
      prev[cur] = callback(cur);
    } else {
      prev[cur] = cur;
    }
    return prev;
  }, {} as any);
}
