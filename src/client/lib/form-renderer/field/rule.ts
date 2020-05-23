/**
 * Rules
 */

import { IsArray } from '@forgleaner/utils/type-check';
import * as Validator from '@forgleaner/utils/validator';

import { IFieldRule } from './type';

// 定义规则类型
export enum FieldRuleType {
  required = 'required',
  number = 'number',
  email = 'email',
  maxLength = 'maxLength',
  length = 'length',
  minLength = 'minLength',
  cellphone = 'cellphone',
  idCard = 'idCard',
  intPositive = 'intPositive',
  decimalPositive = 'decimalPositive'
}

export class FieldRuleRequired implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.required;
  message = '该值必填';
  validate = function (val: any) {
    if (IsArray(val)) {
      return val.length;
    }
    return Validator.Required(val);
  };
}

export class FieldRuleNumber implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.number;
  message = '只允许数字';
  validate = Validator.IsNumber;
}

export class FieldRuleEmail implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.email;
  message = '不符合的邮箱格式';
  validate = Validator.IsEmail;
}

export class FieldRuleMaxLength implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.maxLength;
  message = '字符超出限制的长度';
  value: number;

  constructor(maxLength: number) {
    this.value = maxLength;
  }

  validate = function (data: any) {
    return Validator.LenLimit(data, null, this.value);
  };
}

export class FieldRuleLength implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.length;
  message = '字符长度';
  value: number;

  constructor(length: number) {
    this.value = length;
    this.message = `请输入${this.value}位`;
  }

  validate = function (data) {
    if (data) {
      return data.length === this.value;
    }
    return true;
  };
}

export class FieldRuleMinLength implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.minLength;
  message = '字符少于限制的长度';
  value: number;

  constructor(minLength: number) {
    this.value = minLength;
  }

  validate = function (data: any) {
    return Validator.LenLimit(data, this.value, null);
  };
}

export class FieldRuleCellphone implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.cellphone;
  message = '不符合的手机号';
  validate = Validator.IsCellphone;
}

export class FieldRuleIntPositive implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.intPositive;
  message = '不符合的正整数';
  validate = function (data: any) {
    return Validator.IsInt(data, true);
  };
}

export class FieldRuleDecimalPositive implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.decimalPositive;
  message = '不符合的浮点数';
  positive = true;
  digits = 2;

  constructor(digits: number) {
    this.digits = digits;
  }

  validate = function (data: any) {
    return Validator.IsDecimal(data, this.positive, this.digits);
  };
}

export class FieldRuleIdCard implements IFieldRule<typeof FieldRuleType> {
  type = FieldRuleType.idCard;
  message = '不符合的身份证号码';
  validate = Validator.IsIdCard;
}

/**
 * 验证给定的值和规则
 * @param data
 * @param rules
 * @constructor
 */
export function ValidateRules(
  data: any,
  rules: IFieldRule<any>[]
): {
  valid: boolean;
  message: string;
} {
  const res = {
    valid: true,
    message: ''
  };
  res.valid = rules.every((rule, index, array) => {
    if (rule && rule.validate) {
      const s = rule.validate(data);
      if (!s) {
        res.message = rule.message;
      }
      return s;
    }
    return true;
  });
  return res;
}

/**
 * 转换规则数组为 object
 */
export function ConvertRulesToObject(rules: IFieldRule<any>[]) {
  const rulesObj = {};
  for (let i = 0, l = rules.length; i < l; i++) {
    const rule = rules[i];
    rulesObj[rule.type] = rule;
  }
  return rulesObj;
}
