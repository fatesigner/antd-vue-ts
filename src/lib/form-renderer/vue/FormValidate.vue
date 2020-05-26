<template>
  <form class="form-validate" @submit.prevent="onSubmit">
    <slot />
    <button type="submit" ref="btn" hidden>提交</button>
  </form>
</template>

<script lang="ts">
import { Component, Emit, Prop, Provide, Vue } from 'vue-property-decorator';

import { IFormValidateHandler } from '../type';
import FormValidateItem from './FormValidateItem.vue';

@Component({
  name: 'FormValidate',
  components: {
    FormValidateItem
  }
})
export default class FormValidate extends Vue {
  @Prop({ default: undefined, type: [String, Number, Boolean, Date, Array, Object] }) model;

  items: any[] = [];
  handler: Partial<IFormValidateHandler<any>> = {
    controls: {}
  };

  @Emit('submit')
  emitSubmit(e) {}

  @Emit('change')
  emitChange(e) {}

  @Provide('addValidateHandler')
  addValidateHandler(fieldName: string, handler: any) {
    if (!Object.prototype.hasOwnProperty.call(this.handler.controls, fieldName)) {
      this.handler.controls[fieldName] = handler;
    }
  }

  created() {
    this.handler.validate = this.validate;
    this.handler.clear = this.clear;
    this.handler.reset = this.reset;
    this.handler.submit = this.submit;
  }

  mounted() {
    this.emitChange(this.handler);
  }

  getData() {
    const res = {};
    for (const v in this.handler.controls) {
      if (Object.prototype.hasOwnProperty.call(this.handler.controls, v)) {
        if (!this.model || (this.model && this.model[v].visible)) {
          res[v] = this.handler.controls[v].getData();
        }
      }
    }
    return res;
  }

  validate(): boolean {
    let res = true;
    for (const v in this.handler.controls) {
      if (Object.prototype.hasOwnProperty.call(this.handler.controls, v)) {
        if (!this.model || (this.model && this.model[v].visible)) {
          const r = this.handler.controls[v].validate();
          if (!r) {
            res = r;
          }
        }
      }
    }
    return res;
  }

  clear() {
    this.items.forEach((item) => item.clear());
  }

  reset() {}

  submit() {
    // (this.$refs.form as any).submit();
    (this.$refs.btn as any).click();
  }

  private onSubmit(e) {
    // 先验证
    const valid = this.validate();
    if (valid) {
      this.emitSubmit(e);
    }
  }
}
</script>
