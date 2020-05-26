/**
 * select
 */

import { Trim } from '@forgleaner/utils/trim';

import { IGenerateField } from '../../type';
import { FieldSelect } from '../../field';

export const Generate: IGenerateField = function (control: FieldSelect) {
  return new Promise((resolve) => {
    let template = '';

    const oriFilter = control.filter;

    let optionsOri = control.options;

    control.filter = async function (keyword, update, abort) {
      keyword = Trim(keyword);
      let options = [];
      // 先初始化数据
      if (control.loadData && !optionsOri.length) {
        optionsOri = await control.loadData(keyword).catch(() => {
          abort();
          return [];
        });
      }
      // 过滤数据
      if (keyword && oriFilter) {
        options = await oriFilter(keyword, optionsOri).catch(() => {
          abort();
          return [];
        });
      } else {
        options = optionsOri;
      }
      update(() => {
        control.options = options;
      });
    } as any;

    template = `<div class="q-field-item"
                   :key="controls.${control.name}.name"
                   v-show="controls.${control.name}.visible">
                <div class="q-field-label"><span class="form-render-require"
                v-if="controls.${control.name}.required"></span>{{controls.${control.name}.label}}
            </div>
                <div class="q-field-content">
                  <q-select
        filled place dense square
        use-chipss
        v-model="controls.${control.name}.value"
        :options="controls.${control.name}.options"
        :option-value="controls.${control.name}.displayValue"
        :option-label="controls.${control.name}.displayText"
        :placeholder="controls.${control.name}.placeholder"
        emit-value
        map-options
        @filter="controls.${control.name}.filter"
        ${oriFilter ? 'use-input' : ''}
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              暂无数据
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:append v-if="controls.${control.name}.clearable">
          <q-icon
            v-if="controls.${control.name}.value !== null"
            class="cursor-pointer"
            style="font-size: 14px;"
            name="close"
            title="清除"
            @click.stop="controls.${control.name}.value = null"
          />
        </template>
      </q-select>
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

    resolve({
      control,
      template
    });
  });
};
