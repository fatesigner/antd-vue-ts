/**
 * global
 */

import { ConvertModelArrToEnum } from '../lib/ts-helper';

export const AppKey = 'sales-manage';

export const Title = '蓝色冰川销售管理系统';

// 用户级别
export const AgentLevel = ConvertModelArrToEnum([
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
]);

// 用户类型
export const AgentType = ConvertModelArrToEnum([
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
]);

// 订单状态
export const CheckedStatus = ConvertModelArrToEnum([
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
]);

// 支付状态
export const PaidStatus = ConvertModelArrToEnum([
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
]);

// 支付方式
export const PaymentType = ConvertModelArrToEnum([
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
]);

// 充值方式
export const RechargeType = ConvertModelArrToEnum([
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
]);

// 用户角色
export const Role = ConvertModelArrToEnum([
  {
    name: 'admin',
    value: 'admin',
    text: '管理员',
    testAccount: {
      username: 'admin',
      password: 'lscb#2020'
    }
  },
  // 财务
  {
    name: 'sale_financial',
    value: 'sale_financial',
    text: '财务',
    testAccount: {
      username: 'financial',
      password: 'lsbc#123456'
    }
  },
  // 专员
  {
    name: 'sale_commissioner',
    value: 'sale_commissioner',
    text: '专员',
    testAccount: {
      username: 'commissioner',
      password: 'lsbc#123456'
    }
  },
  // 销售仓库
  {
    name: 'sale_warehouse',
    value: 'sale_warehouse',
    text: '仓库',
    testAccount: {
      username: 'warehouse',
      password: 'lsbc#123456'
    }
  },
  // 销售运营
  {
    name: 'sale_operate',
    value: 'sale_operate',
    text: '运营',
    testAccount: {
      username: 'operate',
      password: 'lsbc#123456'
    }
  }
]);

export const DerateType = ConvertModelArrToEnum([
  {
    value: 1,
    text: '时间减免',
    name: 'time'
  }
]);

export const DerateCondition = ConvertModelArrToEnum([
  {
    value: 1,
    text: '首次申请',
    name: 'first'
  }
]);

export const DerateStatus = ConvertModelArrToEnum([
  {
    value: 0,
    text: '无效',
    name: 'invalid'
  },
  {
    value: 1,
    text: '有效',
    name: 'valid'
  }
]);

export const RewardType = ConvertModelArrToEnum([
  {
    value: 1,
    text: '按订货数每台奖励',
    name: '按订货数每台奖励'
  },
  {
    value: 2,
    text: '按订货总额比例奖励',
    name: '按订货总额比例奖励'
  }
]);

export const ShipType = ConvertModelArrToEnum([
  {
    value: 1,
    text: '自主发货',
    name: '自主发货'
  },
  {
    value: 2,
    text: '公司代发',
    name: '公司代发'
  }
]);

export const ReceiveType = ConvertModelArrToEnum([
  {
    value: 1,
    text: '物流',
    name: '物流'
  },
  {
    value: 2,
    text: '自取',
    name: '自取'
  }
]);

export const ReceiverType = ConvertModelArrToEnum([
  {
    value: 1,
    text: '自营仓储',
    name: '自营仓储'
  },
  {
    value: 2,
    text: '公司代存',
    name: '公司代存'
  }
]);
