/**
 * number
 */

import { IsFunction } from '@forgleaner/utils/type-check';

import { IGenerateField } from '../../type';
import { FieldNumber, FieldStyle } from '../../field';

export const Generate: IGenerateField = function (control: FieldNumber) {
  return new Promise((resolve) => {
    let template = '';

    if (control.style === FieldStyle.Clickable || control.style === FieldStyle.StackedClick) {
      control.onClick = (e) => {
        if (!control.readonly && IsFunction(control.onClick)) {
          control.onClick(control, e);
        }
      };
    }

    if (control.style === FieldStyle.Clickable) {
      template = `<form-validate-item class="form-render-item-click" name="${control.name}" :model="controls.${control.name}.value" :rules="controls.${control.name}.rules" v-show="controls.${control.name}.visible">
<div class="q-field-item"
                   v-if="col.addable && controls.control[col.name]"
                   :key="col.name">
                <div class="q-field-label">{{controls.${control.name}.label}}</div>
                <div class="q-field-content">
                  <q-input
              v-model.number="controls.${control.name}.value"
              :label="controls.${control.name}.label"
              :placeholder="controls.${control.name}.placeholder"
              readonly="true"
              type="number"
              :disabled="controls.${control.name}.readonly"
              :prefix="controls.${control.name}.prefix"
              :suffix="controls.${control.name}.suffix"
              @click="controls.${control.name}.onClick">
                <div class="mu-select-action" @click="controls.${control.name}.onClick">
                  <svg viewBox="0 0 24 24" class="mu-select-icon"><path d="M7 10l5 5 5-5z"></path></svg>
                </div>
              </q-input>
                </div>
              </div>
            <div class="form-render-require" v-if="controls.${control.name}.required"></div>
            </form-validate-item>`;
    } else {
      template = `<div class="q-field-item"
                   :key="controls.${control.name}.name"
                   v-show="controls.${control.name}.visible">
                <div class="q-field-label"><span class="form-render-require"
                v-if="controls.${control.name}.required"></span>{{controls.${control.name}.label}}
            </div>
                <div class="q-field-content">
                  <q-input filled place dense square
              type="number"
              v-model.number="controls.${control.name}.value"
              :placeholder="controls.${control.name}.placeholder"
              :disabled="controls.${control.name}.readonly"
              :min="controls.${control.name}.min"
              :max="controls.${control.name}.max"
              :prefix="controls.${control.name}.prefix"
              :suffix="controls.${control.name}.suffix">
              </q-input>
              <q-slide-transition>
       <div class="form-validate-state" v-if="controls.${control.name}.invalid.visible">
       <div class="form-validate-help-text"
           v-if="controls.${control.name}.helpText && !controls.${control.name}.invalid.visible" key="help">
      {controls.${control.name}.helpText}}
      </div>
      <div class="form-validate-error" key="error">{{controls.${control.name}.invalid.message}}</div>
</div>
    </q-slide-transition>
           </div></div>`;
    }

    resolve({
      control,
      template
    });
  });
};
