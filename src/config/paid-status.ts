/**
 * paidStatus 支付状态
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const PaidStatusItems = [
  {
    value: 1,
    text: '已完成',
    name: 'completed'
  },
  {
    value: 2,
    text: '待审核',
    name: 'inReview'
  },
  {
    value: 3,
    text: '已取消',
    name: 'canceled'
  }
];

export const PaidStatusEnum = ConvertModelArrToEnum(PaidStatusItems, 'name', 'value');

export const PaidStatusDesc = ConvertModelArrToEnum(PaidStatusItems, 'value', 'text');
