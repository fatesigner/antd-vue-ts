/**
 * agent-type 用户类型
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const AgentTypeItems = [
  {
    value: 1,
    text: '公司',
    name: '公司'
  },
  {
    value: 2,
    text: '个体',
    name: '个体'
  }
];

export const AgentTypeEnum = ConvertModelArrToEnum(AgentTypeItems, 'name', 'value');

export const AgentTypeDesc = ConvertModelArrToEnum(AgentTypeItems, 'value', 'text');
