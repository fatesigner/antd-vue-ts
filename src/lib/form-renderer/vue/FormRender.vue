<template>
  <transition-group tag="div" name="form-render" class="form-render-wapper" :class="{ loading: loading }">
    <div class="form-render-skeleton" key="skeleton" v-if="loading && hasSkeleton">
      <ul>
        <li v-for="item in skeleton.count" :key="item.index">{{ item }}</li>
      </ul>
    </div>
    <div class="form-render-spinner" key="spinner" v-if="loading && !hasSkeleton">
      <mu-circular-progress class="demo-circular-progress" :size="spinerSize"></mu-circular-progress>
    </div>
    <component :is="cmp" key="comp" @submit="onSubmit" v-if="!loading"></component>
  </transition-group>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { Debounce } from '@forgleaner/utils';
import { GetGUID } from '@forgleaner/utils/random';

import { IField } from '../field';
import { FormRenderer } from '../core';
import { IFormRenderer } from '../type';
import { GenerateContainer, GenerateField } from '../generate/quasar';

@Component({
  name: 'FormRender'
})
export default class FormRender extends Vue {
  @Prop() handler: IFormRenderer;
  @Prop({ default: `form_${GetGUID(5)}` }) name: string;
  @Prop({ default: false }) hasSubmitBtn: boolean;
  @Prop({ default: '提交' }) submitBtnName: string;
  @Prop({ default: true }) hasSkeleton: boolean;
  @Prop({ default: 32 }) spinerSize: number;
  @Prop({ default: [] }) fields: IField<any, any>[];

  skeleton = {
    // 获取视窗高度，以确定骨架高度
    // count: Math.ceil(GetViewportHeight(document) / 120) * 4
    count: 0
  };

  loading = true;
  cmp = null;

  handler_: IFormRenderer;

  @Watch('fields', {
    immediate: true
  })
  onFieldsChange() {
    this.render();
  }

  @Emit('update:handler')
  emitChange(e) {}

  @Emit('submit')
  emitSubmit(e) {}

  constructor() {
    super();
    this.render = Debounce(this.render, 100, false, () => {
      this.loading = this.fields && this.fields.length > 0;
    });
  }

  mounted() {
    this.skeleton.count = Math.ceil(this.$el.parentElement.getBoundingClientRect().height / 70) * 3;
    // this.handler$ = this.handler$_.asObservable();
    // this.$emit('update:handler', this.handler_.asObservable())
  }

  private onSubmit(e) {
    // 先验证
    const valid = this.handler_.validate();
    if (valid) {
      const formData = this.handler_.getData();
      this.emitSubmit(formData);
    }
  }

  render() {
    if (this.fields && this.fields.length) {
      this.loading = true;
      const formRenderer = new FormRenderer(
        this.fields,
        {
          fieldRender: GenerateField,
          containerRender: GenerateContainer
        },
        (controls, template) => {
          return new Promise((resolve) => {
            const self = this;
            const compileRes = Vue.compile(template);
            this.cmp = {
              render: compileRes.render,
              data() {
                return {
                  controls: controls,
                  hasSubmitBtn: self.hasSubmitBtn,
                  submitBtnName: self.submitBtnName
                };
              },
              methods: {
                submit() {
                  (this.$refs.btn as any).click();
                },
                onFormSubmit(e) {
                  this.$emit('submit', e);
                }
              },
              mounted() {
                Object.keys(this.controls).forEach((name: string) => {
                  if (this.controls[name].initializer) {
                    this.controls[name].initializer(this.controls);
                  }
                });
                Object.keys(this.controls).forEach((name: string) => {
                  if (this.controls[name].watcher.handler) {
                    const _this = this;
                    this.$watch(
                      `controls.${name}.value`,
                      (newVal, oldVal) => {
                        _this.controls[name].watcher.handler.call(_this.controls[name], newVal, oldVal, _this.controls);
                      },
                      {
                        immediate: _this.controls[name].watcher.immediate,
                        deep: _this.controls[name].watcher.deep
                      }
                    );
                  }
                });
                resolve({
                  controls: this.controls,
                  submit: this.submit
                });
                self.handler_ = formRenderer;
                self.emitChange(formRenderer);
              }
            };
            this.loading = false;
          });
        }
      );
    }
  }
}
</script>
