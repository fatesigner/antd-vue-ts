/**
 * rechargeType 充值方式
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const RechargeTypeItems = [
  {
    value: 1,
    text: '申请代理',
    name: 'agent'
  },
  {
    value: 2,
    text: '申请升级',
    name: 'level'
  },
  {
    value: 3,
    text: '余额充值',
    name: 'charge'
  }
];

export const RechargeTypeEnum = ConvertModelArrToEnum(RechargeTypeItems, 'name', 'value');

export const RechargeTypeDesc = ConvertModelArrToEnum(RechargeTypeItems, 'value', 'text');
