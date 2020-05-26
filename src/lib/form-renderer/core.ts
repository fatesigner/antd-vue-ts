/**
 * core
 */

import { IsFunction } from '@forgleaner/utils/type-check';

import { IFormCompileAction, IFormRenderControls, IFormRenderer, IFormRendererProvider } from './type';
import { FieldRuleType, IField, ValidateRules } from './field';

export class FormRenderer<TFieldKeys = any, TFieldTypes = any, TFieldRules = any>
  implements IFormRenderer<TFieldKeys, TFieldTypes, TFieldRules> {
  controls: IFormRenderControls<TFieldKeys>;

  constructor(
    private fields: IField<TFieldKeys, TFieldTypes, TFieldRules>[],
    private config: IFormRendererProvider<TFieldKeys, TFieldTypes, TFieldRules>,
    private compileAction: IFormCompileAction<TFieldKeys>
  ) {
    this.render(compileAction);
  }

  async render(compileAction: IFormCompileAction<TFieldKeys>) {
    // generate field controls
    const controls: IFormRenderControls<TFieldKeys> = {} as any;
    let template = '';
    if (this.fields && this.fields.length) {
      for (const field of this.fields) {
        const control = this.mappingFieldToControl(field);
        field.required = field.rules.some((rule) => {
          return rule && rule.type === FieldRuleType.required;
        });
        await this.config.fieldRender(field).then((res) => {
          if (res && res.control) {
            controls[field.name] = res.control;
            template += res.template;
          }
        });
      }
    }

    const res = await compileAction(controls, this.config.containerRender(template));

    this.submit = res.submit;
    this.controls = res.controls;
  }

  validate() {
    let res = true;
    for (const v in this.controls) {
      if (Object.prototype.hasOwnProperty.call(this.controls, v)) {
        const control: IField<TFieldKeys, TFieldTypes, TFieldRules> = this.controls[v];
        if (!control || (control && control.visible)) {
          const val = ValidateRules(control.value, control.rules);
          control.invalid.message = val.message;
          control.invalid.visible = !val.valid;
          if (control.invalid.visible) {
            /* window.setTimeout(() => {
              this.error.visible = false;
            }, 2000); */
          }
          if (!val.valid) {
            res = val.valid;
          }
        }
      }
    }
    return res;
  }

  // 提取表单的值 返回一个对象
  getData() {
    let data = {} as any;
    for (const v in this.controls) {
      if (Object.prototype.hasOwnProperty.call(this.controls, v)) {
        const obj = this.controls[v];
        if (!obj.submitable) {
          continue;
        }
        if (IsFunction(obj.getValueForSubmit)) {
          data = {
            ...data,
            ...obj.getValueForSubmit()
          };
        }
      }
    }
    return data;
  }

  // 重置表单
  reset(fieldName?: string) {
    if (fieldName) {
      const control = this.controls[fieldName];
      if (control) {
        control.reset(undefined, { onlySelf: true, emitEvent: false });
        if (control.onReset) {
          control.onReset();
        }
      }
    } else {
      Object.keys(this.controls).forEach((key) => {
        const control = this.controls[key];
        control.reset(undefined, { onlySelf: true, emitEvent: false });
        if (control.onReset) {
          control.onReset();
        }
      });
    }
  }

  clear() {
    Object.keys(this.controls).forEach((key) => {
      const control = this.controls[key];
      if (control) {
        control.reset();
      }
    });
  }

  submit: () => void;

  private mappingFieldToControl(field: IField<TFieldKeys, TFieldTypes, TFieldRules>) {
    /* const control: any = {};
    control.value = field.value;
    control.name = field.name;
    control.label = field.label;
    control.description = field.description;
    control.placeholder = field.placeholder;
    control.style = field.style;
    control.submitable = field.submitable;
    control.visible = field.visible;
    control.readonly = field.readonly;
    control.rules = field.rules;
    control.getValueForSubmit = field.getValueForSubmit;
    control.getValue = field.getValue;
    //control.getText = field.getText;
    control.reset = field.reset;
    control.onReset = field.onReset;
    control.onClick = field.onClick;
    control.watcher = field.watcher;
    control.meta = field.meta;
    control.invalid = field.invalid; */
    field.required = field.rules.some((rule) => {
      return rule && rule.type === FieldRuleType.required;
    });
    return field;
  }
}
