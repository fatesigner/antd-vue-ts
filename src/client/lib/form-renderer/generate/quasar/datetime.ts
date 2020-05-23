/**
 * datetime
 */

import { IGenerateField } from '../../type';
import { FieldDatetime } from '../../field';

export const Generate: IGenerateField = function (control: FieldDatetime) {
  return new Promise((resolve) => {
    let template = '';

    template = `<form-validate-item name="${control.name}" :model="controls.${control.name}.value" :rules="controls.${control.name}.rules" v-show="controls.${control.name}.visible">
            <mu-date-input v-model="controls.${control.name}.value" :type="controls.${control.name}.dateTimeMode" :format="controls.${control.name}.displayFormat" :value-format="controls.${control.name}.pickerFormat" :label="controls.${control.name}.title" :placeholder="controls.${control.name}.placeholder" full-width></mu-date-input>
            <div class="form-render-require" v-if="controls.${control.name}.required"></div>
          </form-validate-item>`;

    resolve({
      control,
      template
    });
  });
};
