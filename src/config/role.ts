/**
 * role-keys
 */

import { IRoles } from '../models/role';
import { ConvertArrToEnum } from '../client/lib/ts-helper';

// 定义角色清单
export const RoleKeys = ['admin', 'sale_financial', 'sale_commissioner', 'sale_warehouse', 'sale_operate'] as const;

// 定义角色描述
export const RoleDescs: Record<typeof RoleKeys[number], string> = {
  admin: '管理员',
  sale_financial: '财务',
  sale_commissioner: '专员',
  sale_warehouse: '仓库',
  sale_operate: '运营'
};

// 生成角色枚举
export const RoleEnum = ConvertArrToEnum(RoleKeys);

// 定义角色数据
export const RoleData: IRoles<typeof RoleKeys> = [
  {
    value: 'admin',
    text: '管理员',
    testAccount: {
      username: 'admin',
      password: 'lscb#2020'
    }
  },
  // 财务
  {
    value: 'sale_financial',
    text: '财务',
    testAccount: {
      username: 'financial',
      password: 'lsbc#123456'
    }
  },
  // 专员
  {
    value: 'sale_commissioner',
    text: '专员',
    testAccount: {
      username: 'commissioner',
      password: 'lsbc#123456'
    }
  },
  // 销售仓库
  {
    value: 'sale_warehouse',
    text: '仓库',
    testAccount: {
      username: 'warehouse',
      password: 'lsbc#123456'
    }
  },
  // 销售运营
  {
    value: 'sale_operate',
    text: '运营',
    testAccount: {
      username: 'operate',
      password: 'lsbc#123456'
    }
  }
];
