<template>
  <a-button
    class="as-action-delete"
    :icon="icon"
    :size="size"
    :type="type"
    :loading="loading"
    title="上传"
    v-file-chooser="getFileChooserOptions()"
    @fileChooserChange="fileChooser.onFileChooserChange.call(getContext(), $event)"
    @fileChooserError="fileChooser.onFileChooserError.call(getContext(), $event)"
    ><slot
  /></a-button>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { GetGUID } from '@fatesigner/utils/random';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IFileChooserChangeResponse, IFileChooserOptions } from '@fatesigner/file-chooser/interfaces';
import { FileChooserDirectiveForVue } from '@fatesigner/file-chooser/directives/file-chooser.directive';

import AsAction from './AsAction.vue';

Vue.use(Button);

Vue.use(FileChooserDirectiveForVue);

@Component({
  name: 'AsActionUpload',
  components: {
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: 'file' }) name: string;
  @Prop({ default: 'small' }) size: string;
  @Prop({ default: null }) icon: string;
  @Prop({ default: 'default' }) type: string;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;
  @Prop({ default: '' }) accept: string;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) multiple: boolean;
  @Prop({ default: 1000 }) maxCount: number;
  @Prop({ default: 10 * 1024 }) maxSize: number;

  getContext() {
    return this;
  }

  loading = false;

  fileChooser = {
    async onFileChooserChange(res: IFileChooserChangeResponse) {
      if (this.handler) {
        this.loading = true;
        this.handler((this.multiple ? res.files : res?.files[0] ?? null) as any)
          .catch((err: Error) => {
            this.$notification.error({ message: '', description: err.message });
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    onFileChooserError(err: Error) {
      this.$notification.error({ message: '', description: err.message });
    }
  };

  getFileChooserOptions(): IFileChooserOptions {
    return {
      id: GetGUID(12),
      accept: this.accept,
      multiple: this.multiple,
      maxCount: this.maxCount,
      maxSize: this.maxSize,
      compress: {
        quality: 0.6
      }
    };
  }

  trigger() {
    (this.$refs?.actionRef as any)?.trigger();
  }
}
</script>
