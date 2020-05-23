/**
 * paymentType 支付方式
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const PaymentTypeItems = [
  {
    value: 1,
    text: '微信充值',
    name: 'wechat'
  },
  {
    value: 2,
    text: '向公司转账',
    name: 'bank'
  },
  {
    value: 3,
    text: '付款',
    name: 'cash'
  },
  {
    value: 4,
    text: '提现',
    name: 'withdraw'
  },
  {
    value: 5,
    text: '推荐奖励',
    name: 'award'
  }
];

export const PaymentTypeEnum = ConvertModelArrToEnum(PaymentTypeItems, 'name', 'value');

export const PaymentTypeDesc = ConvertModelArrToEnum(PaymentTypeItems, 'value', 'text');
