/**
 * vuex-storeg
 */

// 将指定的模型集合数据转换为枚举类型
export function ConvertModelArrToEnum<
  T extends Readonly<Array<{ name: TName; value: TValue; text: TText } & { [key in string]: any }>>,
  TName extends string,
  TValue extends string | number,
  TText extends string | number
>(arr: T) {
  const res: {
    arr: T;
    enum: {
      [key in T[number]['name']]: T[number]['value'];
    };
    desc: {
      [key in T[number]['value']]: T[number]['text'];
    };
    keys: T[number]['name'][];
  } = {
    arr: null,
    enum: null,
    desc: null,
    keys: []
  };

  res.arr = arr;

  res.enum = arr.reduce((prev, cur) => {
    prev[cur.name] = cur.value;
    return prev;
  }, {} as any);

  res.desc = arr.reduce((prev, cur) => {
    prev[cur.value] = cur.text;
    return prev;
  }, {} as any);

  res.keys = arr.map((x) => x.name);

  return res;
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
