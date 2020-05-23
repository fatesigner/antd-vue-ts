/**
 * field
 */

import { DateFormat } from '@forgleaner/utils/date';
import { IsBoolean, IsFunction, IsNullOrUndefined, IsNumber, IsString } from '@forgleaner/utils/type-check';

import { IField, IFieldWatcher, IFieldWatchHandler } from './type';
import { UnionType } from '../../ts-helper';

export enum FieldPlatform {
  native = 'native',
  h5 = 'h5',
  wechat = 'wechat'
}

export enum DateTimeMode {
  year = 'year',
  month = 'month',
  dateTime = 'dateTime'
}

export enum FieldStyle {
  FloatingText = 'FloatingText',
  Clickable = 'Clickable',
  Stacked = 'Stacked',
  StackedClick = 'StackedClick'
}

/**
 * 定义字段类型
 */
export enum FieldType {
  text = 'text',
  number = 'number',
  password = 'password',
  checkbox = 'checkbox',
  radio = 'radio',
  select = 'select',
  textarea = 'textarea',
  datetime = 'datetime',
  inputRange = 'inputRange',
  inputFile = 'inputFile',
  inputImg = 'inputImg',
  custom = 'custom'
}

/**
 * 字段
 */
export abstract class Field<TFieldKeys = any, TFieldTypes = any, TFieldRuleTypes = any>
  implements IField<TFieldKeys, TFieldTypes, TFieldRuleTypes> {
  // 字段名
  name: UnionType<TFieldKeys>;
  // 字段类型
  type = null;
  // 字段标题
  label? = '';
  // 字段描述
  description? = '';
  // 占位符
  placeholder? = '';
  // 值
  value? = null;
  // 默认值
  defaultValue? = null;
  // 可见
  visible? = true;
  // 只读
  readonly? = false;
  submitable? = true;
  addable? = true;
  editable? = true;
  rules? = [];
  // 点击事件回调
  onClick? = null;
  // reset事件回调
  onReset? = null;
  // 初始化事件
  initializer? = null;
  // watch
  watcher: IFieldWatcher<TFieldKeys> = {
    handler: null,
    immediate: false,
    deep: false
  };

  // 表现形式
  style? = null;
  // 其他数据
  meta? = null;
  invalid? = {
    visible: false,
    message: ''
  };

  protected constructor(params: IField<TFieldKeys, TFieldTypes, TFieldRuleTypes>) {
    if (params.name) {
      this.name = params.name;
    } else {
      if (params.type !== FieldType.custom) {
        Field.throwRequiredPropError('name', this.description);
      }
    }
    if (!IsNullOrUndefined(params.value)) {
      this.value = params.value;
    }
    if (!IsNullOrUndefined(params.type)) {
      this.type = params.type;
    }
    if (!IsNullOrUndefined(params.label)) {
      this.label = params.label;
    }
    if (!IsNullOrUndefined(params.description)) {
      this.description = params.description;
    } else {
      this.description = this.label;
    }
    if (!IsNullOrUndefined(params.style)) {
      this.style = params.style;
    }
    if (!IsNullOrUndefined(params.placeholder)) {
      this.placeholder = params.placeholder;
    } else {
      this.placeholder = `${
        this.type === FieldType.select || this.style === FieldStyle.Clickable || this.style === FieldStyle.StackedClick
          ? '请选择'
          : '请输入'
      }${this.description}`;
    }
    if (!IsNullOrUndefined(params.value)) {
      this.value = params.value;
    }
    if (!IsNullOrUndefined(params.defaultValue)) {
      this.defaultValue = params.defaultValue;
    }
    if (IsBoolean(params.visible)) {
      this.visible = params.visible;
    }
    if (IsBoolean(params.readonly)) {
      this.readonly = params.readonly;
    }
    if (IsBoolean(params.submitable)) {
      this.submitable = params.submitable;
    }
    if (!IsNullOrUndefined(params.rules)) {
      this.rules = params.rules;
    }
    if (!IsNullOrUndefined(params.onClick)) {
      this.onClick = params.onClick;
    }
    if (IsFunction(params.onReset)) {
      this.onReset = params.onReset;
    }
    if (IsFunction(params.initializer)) {
      this.initializer = params.initializer;
    }
    if (!IsNullOrUndefined(params.watcher)) {
      if (IsFunction(params.watcher)) {
        (this.watcher as IFieldWatcher<TFieldKeys>).handler = params.watcher as IFieldWatchHandler<TFieldKeys>;
      } else {
        this.watcher = Object.assign(this.watcher, params.watcher);
      }
    }
    if (IsFunction(params.getValueForSubmit)) {
      this.getValueForSubmit = params.getValueForSubmit;
    }
    if (IsFunction(params.reset)) {
      this.reset = params.reset;
    }
    if (!IsNullOrUndefined(params.meta)) {
      this.meta = params.meta;
    }
  }

  protected static throwRequiredPropError(prop: string, description?: string) {
    throw new Error(
      'Invalid prop: type check failed for prop "' + prop + '" description "' + description + '". is required'
    );
  }

  getValue() {
    return this.value;
  }

  setValue(value: any): IField<TFieldKeys, TFieldTypes, TFieldRuleTypes> {
    this.value = value;
    return this as any;
  }

  getValueForSubmit() {
    return {
      [this.name]: this.getValue()
    };
  }

  reset(): IField<TFieldKeys, TFieldTypes, TFieldRuleTypes> {
    if (!IsNullOrUndefined(this.defaultValue)) {
      this.value = this.defaultValue;
    } else {
      this.value = undefined;
    }
    if (IsFunction(this.onReset)) {
      window.setTimeout(() => {
        this.onReset();
      });
    }
    (this as any).src = '';
    return this as any;
  }
}

export class FieldText extends Field {
  // 值
  value: string;
  prefix: string;
  suffix: string;

  constructor(
    params: Omit<IField, 'type'> & {
      prefix?: string;
      suffix?: string;
    }
  ) {
    super({
      ...params,
      type: FieldType.text
    } as any);
    if (!IsNullOrUndefined(params.prefix)) {
      this.prefix = params.prefix;
    }
    if (!IsNullOrUndefined(params.suffix)) {
      this.suffix = params.suffix;
    }
  }
}

export class FieldNumber extends Field {
  // 值
  value: number;
  // 最小值
  min: number;
  // 最大值
  max: number;
  step = 1;
  prefix: string;
  suffix: string;

  constructor(
    params: Omit<IField, 'type'> & {
      min?: number;
      max?: number;
      step?: number;
      prefix?: string;
      suffix?: string;
    }
  ) {
    super({
      ...params,
      type: FieldType.number
    } as any);
    if (!IsNullOrUndefined(params.min)) {
      this.min = params.min;
    }
    if (!IsNullOrUndefined(params.max)) {
      this.max = params.max;
    }
    if (!IsNullOrUndefined(params.step)) {
      this.step = params.step;
    }
    if (!IsNullOrUndefined(params.prefix)) {
      this.prefix = params.prefix;
    }
    if (!IsNullOrUndefined(params.suffix)) {
      this.suffix = params.suffix;
    }
  }

  setValue(value: number) {
    this.value = Number(value) || undefined;
    return this;
  }
}

export class FieldTextarea extends Field {
  // 值
  value = '';

  constructor(params: Omit<IField, 'type'>) {
    super({
      ...params,
      type: FieldType.datetime
    } as any);
  }
}

export class FieldDatetime extends Field {
  // 值
  value = '';
  format = 'YYYY-MM-dd';
  displayFormat = 'YYYY-MM-DD';
  pickerFormat = 'YYYY-MM-DD';
  monthNames = '一月, 二月, 三月, 四月, 五月, 六月, 七月, 八月, 九月, 十月, 十一月, 十月';
  monthShortNames = '一月, 二月, 三月, 四月, 五月, 六月, 七月, 八月, 九月, 十月, 十一月, 十月';
  dayNames = '周日, 周一, 周二, 周三, 周四, 周五, 周六';

  dateTimeMode = DateTimeMode.dateTime;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;

  from: Date = new Date();
  to: Date;

  constructor(
    params: Omit<IField, 'type'> & {
      format?: string;
      displayFormat?: string;
      pickerFormat?: string;
      year?: number;
      month?: number;
      day?: number;
      hour?: number;
      minute?: number;
      second?: number;
      from?: Date;
      to?: Date;
      dateTimeMode?: DateTimeMode;
    }
  ) {
    super({
      ...params,
      type: FieldType.datetime
    } as any);
    if (!IsNullOrUndefined(params.value)) {
      this.value = params.value;
    }
    if (IsString(params.format)) {
      this.format = params.format;
    }
    if (IsString(params.displayFormat)) {
      this.displayFormat = params.displayFormat;
    }
    if (IsString(params.pickerFormat)) {
      this.pickerFormat = params.pickerFormat;
    }
    if (IsNumber(params.year)) {
      this.year = params.year;
    }
    if (IsNumber(params.month)) {
      this.month = params.month;
    }
    if (IsNumber(params.day)) {
      this.day = params.day;
    }
    if (IsNumber(params.hour)) {
      this.hour = params.hour;
    }
    if (IsNumber(params.minute)) {
      this.minute = params.minute;
    }
    if (IsNumber(params.second)) {
      this.second = params.second;
    }
    if (!IsNullOrUndefined(params.from)) {
      this.from = params.from;
    }
    if (!IsNullOrUndefined(params.to)) {
      this.to = params.to;
    }
    if (!IsNullOrUndefined(params.dateTimeMode)) {
      this.dateTimeMode = params.dateTimeMode;
    }
  }

  getValue() {
    if (this.value) {
      if (IsString(this.value)) {
        return this.value;
      } else if ((this.value as any).getDate) {
        return this.value && DateFormat(this.value as any, 'yyyy-MM-dd hh:mm:ss');
      }
    }
    return this.value;
    // return this.value && this.value.replace('T', ' ').replace('Z', '');
    // return this.value && format(new Date(this.value), this.displayFormat);
  }
}

export class FieldSelect extends Field {
  // 值
  value: string;
  // 可清除的
  clearable = true;
  displayValue = 'value';
  displayText = 'text';
  options: any[];
  filter: (keyword: string, options: any[]) => Promise<any[]>;
  loadData: (keyword: string) => Promise<any[]>;
  onChange: (val: string) => void;

  constructor(
    params: Omit<IField, 'type'> & {
      options: any[];
      clearable?: boolean;
      displayValue?: string;
      displayText?: string;
      filter?: (keyword: string, options: any[]) => Promise<any[]>;
      loadData?: (keyword: string) => Promise<any[]>;
      onChange?: (val: string) => void;
    }
  ) {
    super({
      ...params,
      type: FieldType.select
    } as any);
    if (!IsNullOrUndefined(params.options)) {
      this.options = params.options;
    }
    if (!IsNullOrUndefined(params.clearable)) {
      this.clearable = params.clearable;
    }
    if (!IsNullOrUndefined(params.displayValue)) {
      this.displayValue = params.displayValue;
    }
    if (!IsNullOrUndefined(params.displayText)) {
      this.displayText = params.displayText;
    }
    if (!IsNullOrUndefined(params.filter)) {
      this.filter = params.filter;
    }
    if (!IsNullOrUndefined(params.loadData)) {
      this.loadData = params.loadData;
    }
    if (!IsNullOrUndefined(params.onChange)) {
      this.onChange = params.onChange;
    }
  }
}

export class FieldCheckbox extends Field {
  // 值
  value = false;

  constructor(
    params: Omit<IField, 'type'> & {
      value?: boolean;
    }
  ) {
    super({
      ...params,
      type: FieldType.checkbox
    } as any);
  }
}

export class FieldRadio extends Field {
  // 值
  value: string;
  options: {
    value: any;
    label: string;
  }[];

  constructor(
    params: Omit<IField, 'type'> & {
      value?: string;
      options: {
        value: any;
        label: string;
      }[];
    }
  ) {
    super({
      ...params,
      type: FieldType.radio
    } as any);
    if (!IsNullOrUndefined(params.options)) {
      this.options = params.options;
    }
  }
}

export class FieldRange extends Field {
  // 最小值
  min: number;
  // 最大值
  max: number;
  defaultValueMin: number;
  defaultValueMax: number;
  placeholderMin = '最低';
  placeholderMax = '最高';
  readonlyMin = false;
  readonlyMax = false;

  constructor(
    params: Omit<IField, 'type'> & {
      placeholderMin?: string;
      placeholderMax?: string;
      min?: number;
      max?: number;
      defaultValueMin?: number;
      defaultValueMax?: number;
      readonlyMin?: boolean;
      readonlyMax?: boolean;
    }
  ) {
    super({
      ...params,
      type: FieldType.inputRange
    } as any);
    if (IsNumber(params.min)) {
      this.min = params.min;
    }
    if (IsNumber(params.max)) {
      this.max = params.max;
    }
    if (!IsNullOrUndefined(params.defaultValueMin)) {
      this.defaultValueMin = params.defaultValueMin;
    }
    if (!IsNullOrUndefined(params.defaultValueMax)) {
      this.defaultValueMax = params.defaultValueMax;
    }
    if (!IsNullOrUndefined(params.placeholderMin)) {
      this.placeholderMin = params.placeholderMin;
    }
    if (!IsNullOrUndefined(params.placeholderMax)) {
      this.placeholderMax = params.placeholderMax;
    }
    if (IsBoolean(params.readonlyMin)) {
      this.readonlyMin = params.readonlyMin;
    }
    if (IsBoolean(params.readonlyMax)) {
      this.readonlyMax = params.readonlyMax;
    }
  }

  reset(): Field {
    if (!IsNullOrUndefined(this.defaultValueMin)) {
      this.min = this.defaultValueMin;
    } else {
      this.min = undefined;
    }
    if (!IsNullOrUndefined(this.defaultValueMax)) {
      this.max = this.defaultValueMax;
    } else {
      this.max = undefined;
    }
    return this;
  }
}

export class FieldInputImg extends Field {
  // 所属平台 h5 native wechat
  platform = FieldPlatform.native;
  // 是否已上传附件
  hasFile: boolean;
  multiple = false;
  value: (string | File)[] = [];
  files: File[] = [];
  imgs: {
    src: string;
    size: {
      width: number;
      height: number;
    };
  }[] = [];

  count = 5;

  constructor(
    params: Omit<IField, 'type'> & {
      value?: File[];
      platform?: FieldPlatform;
      multiple?: boolean;
    }
  ) {
    super({
      ...params,
      type: FieldType.inputImg
    } as any);
    if (params.platform) {
      this.platform = params.platform;
    }
    if (IsBoolean(params.multiple)) {
      this.multiple = params.multiple;
    }
  }
}

export class FieldCustom extends Field {
  template: string;

  constructor(
    params: Omit<IField, 'type'> & {
      template: string;
    }
  ) {
    super({
      ...params,
      type: FieldType.custom
    } as any);
    this.template = params.template;
  }
}
