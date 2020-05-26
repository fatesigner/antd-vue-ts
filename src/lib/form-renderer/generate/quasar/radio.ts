/**
 * radio
 */

import { IGenerateField } from '../../type';
import { FieldRadio } from '../../field';

export const Generate: IGenerateField = function (control: FieldRadio) {
  return new Promise((resolve) => {
    let template = '';

    template = `<div class="q-field-item"
                   :key="controls.${control.name}.name"
                   v-show="controls.${control.name}.visible">
                <div class="q-field-label"><span class="form-render-require"
                v-if="controls.${control.name}.required"></span>{{controls.${control.name}.label}}
            </div>
                <div class="q-field-content">
                  <q-radio v-for="option in controls.${control.name}.options"
                           v-model="controls.${control.name}.value"
                           :val="option.value"
                           :label="option.label"
                           :placeholder="controls.${control.name}.placeholder"
                           :disabled="controls.${control.name}.readonly" />
              <q-slide-transition>
       <div class="form-validate-state" v-if="controls.${control.name}.invalid.visible">
       <div class="form-validate-help-text"
           v-if="controls.${control.name}.helpText && !controls.${control.name}.invalid.visible" key="help">
      {controls.${control.name}.helpText}}
      </div>
      <div class="form-validate-error" key="error">{{controls.${control.name}.invalid.message}}</div></div>
    </q-slide-transition>
           </div></div>`;

    resolve({
      control,
      template
    });
  });
};
