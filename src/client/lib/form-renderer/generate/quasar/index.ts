/**
 * index
 */

import { IGenerateContainer, IGenerateField } from '../../type';
import { FieldCustom, FieldType, IField } from '../../field';

export const GenerateField: IGenerateField = function (control: IField) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    let f;
    if (!control.type || control.type === FieldType.text || control.type === FieldType.password) {
      const _ = await import('./text');
      f = _.Generate(control);
    } else if (control.type === FieldType.number) {
      const _ = await import('./number');
      f = _.Generate(control);
    } else if (control.type === FieldType.inputImg) {
      // const _ = await import('./inputImg');
      // f = _.Generate(control, field);
    } else if (control.type === FieldType.checkbox) {
      const _ = await import('./checkbox');
      f = _.Generate(control);
    } else if (control.type === FieldType.radio) {
      const _ = await import('./radio');
      f = _.Generate(control);
    } else if (control.type === FieldType.datetime) {
      const _ = await import('./datetime');
      f = _.Generate(control);
    } else if (control.type === FieldType.select) {
      const _ = await import('./select');
      f = _.Generate(control);
    } else if (control.type === FieldType.custom) {
      f = {
        control,
        template: (control as FieldCustom).template || ''
      };
    }
    resolve(f);
  });
};

export const GenerateContainer: IGenerateContainer = function (template: string) {
  return `<form :model="controls" @submit.prevent="onFormSubmit">
            ${template}
            <button type="submit" ref="btn" hidden>提交</button>
            <div class="q-field-item" v-if="hasSubmitBtn">
              <div class="q-field-label"></div>
              <div class="q-field-content">
                <q-btn push color="primary" :label="submitBtnName" type="submit" />
              </div>
            </div>
          </form>`;
};
