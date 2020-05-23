/**
 * agent-level 用户级别
 */

import { ConvertModelArrToEnum } from '../client/lib/ts-helper';

export const AgentLevelItems = [
  {
    value: 1,
    text: '老师服务商',
    name: '老师服务商'
  },
  {
    value: 2,
    text: '主任服务商',
    name: '主任服务商'
  },
  {
    value: 3,
    text: '校长服务商',
    name: '校长服务商'
  },
  {
    value: 4,
    text: '战略服务商',
    name: '战略服务商'
  },
  {
    value: 9,
    text: '公司',
    name: '公司'
  }
];

export const AgentLevelEnum = ConvertModelArrToEnum(AgentLevelItems, 'name', 'value');

export const AgentLevelDesc = ConvertModelArrToEnum(AgentLevelItems, 'value', 'text');
