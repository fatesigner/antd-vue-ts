<template>
  <div class="editor">
    <quill-editor ref="quillEditor" v-model="value_" :options="options_" />
  </div>
</template>

<script lang="ts">
import Quill from 'quill';
import { quillEditor } from 'vue-quill-editor';
import ImageUploader from 'quill-image-uploader';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { UploadHandler } from './rich-editor';

Quill.register('modules/imageUploader', ImageUploader);

@Component({
  name: 'RichEditor',
  components: {
    quillEditor
  }
})
export default class extends Vue {
  @Prop({ default: null }) value: string;
  @Prop({ default: null }) limitLength: number;

  @Prop({
    default: () => ({})
  })
  options: any;

  value_ = null;
  options_ = {};
  editor: any = null;

  @Watch('value', {
    immediate: true
  })
  onValueChange(val: string) {
    if (this.value_ !== val) {
      this.value_ = val;
    }
  }

  @Watch('value_')
  onValueChange_(val: string) {
    if (this.value !== val) {
      this.$emit('input', val);
    }
  }

  @Watch('Options', {
    immediate: true
  })
  onOptionsChange(val) {
    this.options_ = Object.assign(
      {},
      {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'image', 'video']
          ],
          imageUploader: {
            upload: UploadHandler
          }
        }
      },
      val
    );
  }
}
</script>

<style lang="scss">
.ql-toolbar,
.ql-toolbar *,
.ql-toolbar ::after,
.ql-toolbar ::before {
  line-height: 26px;
}
.ql-picker-label {
  outline: none;
}
</style>
