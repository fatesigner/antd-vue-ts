/**
 * type
 */

import { UnionType } from '../../ts-helper';

export interface IFieldKeysDefault {
  [key: string]: string;
}

export interface IFieldTypesDefault {
  [key: string]: string;
}

export interface IFieldRulesDefault {
  [key: string]: string;
}

export interface IFieldRule<TFieldRules> {
  type?: UnionType<TFieldRules>;
  message: string;
  validate: (data: any) => boolean;
}

export type IFieldWatchHandler<TFieldKeys = IFieldKeysDefault> = (
  newVal: any,
  oldVal: any,
  controls: {
    [key in UnionType<TFieldKeys>]: IField;
  }
) => void;

export type IFieldWatcher<TFieldKeys = IFieldKeysDefault> = {
  handler: IFieldWatchHandler<TFieldKeys>;
  immediate?: boolean;
  deep?: boolean;
};

export type IFieldInitializer<TFieldKeys = IFieldKeysDefault> = (
  controls: {
    [key in UnionType<TFieldKeys>]: IField;
  }
) => void;

export type IFields<
  TFieldKeys = IFieldKeysDefault,
  TFieldTypes = IFieldTypesDefault,
  TFieldRules = IFieldRulesDefault
> = IField<TFieldKeys, TFieldTypes, TFieldRules>[];

export type IField<
  TFieldKeys = IFieldKeysDefault,
  TFieldTypes = IFieldTypesDefault,
  TFieldRules = IFieldRulesDefault
> = {
  // 字段名
  name: UnionType<TFieldKeys>;
  // 字段类型
  type: UnionType<TFieldTypes>;
  // 字段标题
  label?: string;
  // 字段描述
  description?: string;
  // 占位符
  placeholder?: string;
  // 值
  value?: any;
  // 默认值
  defaultValue?: any;
  // 可见
  visible?: boolean;
  // 只读
  readonly?: boolean;
  // 可被提交
  submitable?: boolean;
  // 可新增
  addable?: boolean;
  // 可编辑
  editable?: boolean;
  // 规则
  rules?: IFieldRule<TFieldRules>[];
  required?: boolean;
  // initial
  initializer?: IFieldInitializer<TFieldKeys>;
  // watch
  watcher?: IFieldWatchHandler<TFieldKeys> | IFieldWatcher<TFieldKeys>;
  // 表现形式
  style?: string;
  // 其他数据
  meta?: any;
  // 用于验证
  invalid?: {
    visible: boolean;
    message: string;
  };
  getValue?: () => any;
  setValue?: (val: any) => IField<TFieldKeys, TFieldTypes, TFieldRules>;
  getValueForSubmit?: () => { [key: string]: any };
  reset?: () => IField<TFieldKeys, TFieldTypes, TFieldRules>;
  // click 事件回调
  onClick?: Function;
  // reset 事件回调
  onReset?: Function;
};
