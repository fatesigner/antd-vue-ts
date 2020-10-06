/**
 * currencyPipe 货币类型格式化
 */

export const CurrencyPipeKey = 'Currency';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CurrencyPipe(value: number): string {
  // return formatter.format(value).replace('$', '￥');
  return `￥${value}`;
}
