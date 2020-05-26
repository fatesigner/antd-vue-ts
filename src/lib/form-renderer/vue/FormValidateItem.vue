<template>
  <div class="form-validate-item">
    <slot></slot>
    <transition-group tag="ul" class="form-validate-state">
      <div class="form-validate-help-text" v-if="helpText && !error.visible" key="help">{helpText_}}</div>
      <div class="form-validate-error" v-if="error.visible" key="error">{{ error.message }}</div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Prop, Vue, Watch } from 'vue-property-decorator';

import { IFormValidateItemHandler } from '../type';
import { IFieldRule, ValidateRules } from '../field';

@Component({
  name: 'FormValidateItem'
})
export default class FormValidateItem extends Vue {
  @Inject('addValidateHandler') addValidateHandler: any;

  @Prop({ default: undefined, type: [String, Number, Boolean, Date, Array] }) model;
  @Prop({ default: undefined }) name: string;
  @Prop({ default: '' }) helpText: string;
  @Prop({ default: [] }) rules: IFieldRule<any>[];

  name_ = '';
  model_ = undefined;
  helpText_ = '';
  rules_ = [];

  @Emit('change')
  emitChange(e) {}

  @Watch('name', {
    immediate: true
  })
  onNameChange(val) {
    this.name_ = val;
  }

  @Watch('model', {
    immediate: true
  })
  onModelChange(val) {
    this.model_ = val;
  }

  @Watch('helpText', {
    immediate: true
  })
  onHelpTextChange(val) {
    this.helpText_ = val;
  }

  @Watch('rules', {
    immediate: true
  })
  onRulesChange(val) {
    this.rules_ = val;
  }

  handler: IFormValidateItemHandler = {
    validate: null,
    getData: null,
    clear: null
  };

  error = {
    visible: false,
    message: ''
  };

  created() {
    this.handler.getData = this.getData;
    this.handler.validate = this.validate;
    this.handler.clear = this.clear;
    if (this.addValidateHandler) {
      this.addValidateHandler(this.name_, this.handler);
    }
  }

  mounted() {
    this.emitChange(this.handler);
  }

  getData() {
    return this.model_;
  }

  validate(): boolean {
    const val = ValidateRules(this.model_, this.rules_);
    this.error.message = val.message;
    this.error.visible = !val.valid;
    if (this.error.visible) {
      /* window.setTimeout(() => {
          this.error.visible = false;
        }, 2000); */
    }
    return val.valid;
  }

  clear() {
    this.error.visible = false;
    this.error.message = '';
  }
}
</script>
