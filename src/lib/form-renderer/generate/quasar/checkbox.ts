/**
 * checkbox
 */

import { IGenerateField } from '../../type';
import { FieldDatetime } from '../../field';

export const Generate: IGenerateField = function (control: FieldDatetime) {
  return new Promise((resolve) => {
    let template = '';

    template = `<form-validate-item name="${control.name}"
                                  :model="controls.${control.name}.value"
                                  :rules="controls.${control.name}.rules"
                                  v-show="controls.${control.name}.visible">
            <label>
              <mu-checkbox v-model="controls.${control.name}.value"
                           :label="controls.${control.name}.title"
                           :placeholder="controls.${control.name}.placeholder">
              </mu-checkbox>
            </label>

            <div class="form-render-require" v-if="controls.${control.name}.required"></div>
          </form-validate-item>`;

    resolve({
      control,
      template
    });
  });
};
