/**
 * checkedStatus
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const CheckedStatusItems = [
  {
    value: 1,
    text: '已提交，待审核',
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
  },
  {
    value: 11,
    text: '专员审核通过',
    name: '专员审核通过'
  },
  {
    value: 12,
    text: '专员审核不通过',
    name: '专员审核不通过'
  },
  {
    value: 13,
    text: '财务审核通过',
    name: '财务审核通过'
  },
  {
    value: 14,
    text: '财务审核不通过',
    name: '财务审核不通过'
  },
  {
    value: 21,
    text: '代理商审核通过',
    name: '代理商审核通过'
  },
  {
    value: 22,
    text: '微信支付通过',
    name: '微信支付通过'
  },
  {
    value: 31,
    text: '代理商审核不通过',
    name: '代理商审核不通过'
  },
  {
    value: 32,
    text: '微信支付取消',
    name: '微信支付取消'
  }
];

export const CheckedStatusEnum = ConvertModelArrToEnum(CheckedStatusItems, 'name', 'value');

export const CheckedStatusDesc = ConvertModelArrToEnum(CheckedStatusItems, 'value', 'text');
