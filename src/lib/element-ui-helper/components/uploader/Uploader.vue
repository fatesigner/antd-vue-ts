<template>
  <div class="uploader">
    <!--<button @click="add">add</button>
    <button @click="remove">remove</button>-->
    <transition-group-zoom tag="ul" class="uploader-files">
      <li
        v-for="(file, index) of files_"
        :key="file.key"
        :style="{ width: width + 'px', 'padding-bottom': width + 'px' }"
      >
        <dl class="uploader-file">
          <dt
            :title="file.error.message || '选择文件'"
            :disabled="file.uploading"
            v-file-chooser="singleFileChooser.options"
            @fileChooserChange="singleFileChooser.onFileChooserChange($event, index, self)"
            @fileChooserError="singleFileChooser.onFileChooserError($event, index, self)"
          >
            <img v-if="file.type === contentType.image" :src="file.src || file.value" alt="" />
          </dt>
          <dd class="uploader-status" v-if="file.uploading"></dd>
          <transition-slide>
            <dd class="uploader-error" v-if="!file.uploading && file.error.visible" :title="file.error.message">
              {{ file.error.message }}
            </dd>
          </transition-slide>
          <transition-zoom>
            <dd class="uploader-done" v-if="!file.uploading && file.value && !file.src" title="已上传">
              <span class="uploader-done-in"><mu-icon size="16" value="done" color="#fff"></mu-icon></span>
            </dd>
          </transition-zoom>
          <dd class="uploader-action" v-if="!file.uploading && file.value && !file.src">
            <mu-button small color="orange" title="查看图片" @click="previewImage(index)">查看 </mu-button>
          </dd>
          <transition-zoom>
            <dd
              class="uploader-remove"
              v-if="!file.uploading && ((deletable && file.value) || file.src)"
              @click="removeFile(index)"
              :title="file.src ? '取消' : '删除'"
            >
              <span class="uploader-remove-in"><mu-icon size="16" value="clear" color="#fff"></mu-icon></span>
            </dd>
          </transition-zoom>
          <dd class="uploader-uploading" v-if="file.uploading">
            <mu-circular-progress color="orange" :size="36" :stroke-width="4"></mu-circular-progress>
          </dd>
          <transition-zoom>
            <dd class="uploader-action" v-if="!file.uploading && file.src">
              <mu-button
                small
                color="orange"
                title="开始上传"
                :disabled="file.uploading"
                @click="singleFileChooser.upload(index, self)"
                >上传
              </mu-button>
            </dd>
          </transition-zoom>
        </dl>
      </li>
      <li v-if="hasMore" :key="-1" :style="{ width: width + 'px', 'padding-bottom': width + 'px' }">
        <dl class="uploader-file" :class="{ error: error.visible }">
          <transition-slide>
            <dd class="uploader-error" v-if="error.message" :title="error.message">{{ error.message }}</dd>
          </transition-slide>
          <mu-button
            class="uploader-choose"
            flat
            color="#999"
            title="选择文件"
            v-file-chooser="fileChooser.options"
            @fileChooserChange="fileChooser.onFileChooserChange($event, self)"
            @fileChooserError="fileChooser.onFileChooserError($event, self)"
          >
            <mu-icon value="add" size="36"></mu-icon>
          </mu-button>
        </dl>
      </li>
    </transition-group-zoom>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { GetImageSize, GetImageSrc } from '@forgleaner/utils/document';
import { GetGUID } from '@forgleaner/utils/random';

import { TransitionSlide, TransitionZoom } from '../../../vue-common/components/transition';
import { TransitionGroupZoom } from '../../../vue-common/components/transition-group';
import { IFileChooserChangeResponse } from '../../../file-chooser';
import { PreviewImage } from '../../../image-viewer';

import { IUploaderActionParams, IUploaderContentType, IUploaderFile } from './model';

@Component({
  name: 'Uploader',
  components: {
    TransitionSlide,
    TransitionZoom,
    TransitionGroupZoom
  }
})
export default class extends Vue {
  @Prop({ default: [] }) files: IUploaderFile[];
  @Prop({ default: null, type: [Object, Promise, Function] }) action: Promise<any>;
  @Prop({ default: null }) data: any;
  @Prop({ default: false }) immediate: boolean;
  @Prop({ default: false }) multiple: boolean;
  @Prop({ default: false }) parallel: boolean;
  @Prop({ default: false }) required: boolean;
  @Prop({ default: false }) deletable: boolean;
  @Prop({ default: null }) count: number;
  @Prop({ default: 128 }) width: number;

  get self() {
    return this;
  }

  files_ = [];
  contentType = IUploaderContentType;
  error = {
    visible: false,
    message: ''
  };

  get hasMore() {
    return this.count <= 0 || this.files_.length < this.count;
  }

  @Watch('files', {
    immediate: true
  })
  onFilesChange(val) {
    if (val !== this.files_) {
      this.files_ = val;
    }
  }

  @Watch('multiple', {
    immediate: true
  })
  onMultipleChange(val) {
    this.fileChooser.options.multiple = val;
    this.singleFileChooser.options.multiple = val;
  }

  @Emit('failed')
  emitFailed(error) {}

  fileChooser = {
    options: {
      name: GetGUID(10),
      count: 1000,
      multiple: this.multiple,
      maxSize: 10 * 1024,
      compress: {
        quality: 0.6
      }
    },
    async onFileChooserChange(res: IFileChooserChangeResponse, self) {
      if (res.files.length) {
        if (this.count && this.count > 0 && res.files.length + self.files_.length >= this.count) {
          self.emitFailed(new Error(`限制上传${this.count}张`));
        } else {
          const index = self.files_.length;
          for (const file of res.files) {
            const _file: IUploaderFile = {
              key: GetGUID(10),
              data: {},
              value: '',
              src: '',
              blob: file,
              type: IUploaderContentType.image,
              uploading: false,
              error: {
                visible: false,
                message: ''
              },
              size: {
                width: 800,
                height: 800
              }
            };
            // 获取图片尺寸
            await GetImageSize(file).then((size) => {
              _file.size = size;
            });
            await GetImageSrc(file).then((src) => {
              _file.src = src;
            });
            self.files_.push(_file);
          }
          // 立即上传
          if (self.immediate) {
            setTimeout(async function () {
              for (let i = index; i < self.files_.length; i++) {
                if (self.parallel) {
                  self.singleFileChooser.upload(i, self);
                } else {
                  await self.singleFileChooser.upload(i, self);
                }
              }
            }, 800);
          }
        }
      }
    },
    onFileChooserError(error, self) {
      self.emitFailed(error);
    }
  };

  singleFileChooser = {
    options: {
      name: GetGUID(10),
      count: 1,
      multiple: this.multiple,
      maxSize: 10 * 1024,
      compress: {
        quality: 0.6
      }
    },
    async onFileChooserChange(res: IFileChooserChangeResponse, index, self) {
      if (res.files.length) {
        const file = self.files_[index];
        // 获取图片尺寸
        await GetImageSize(res.files[0]).then((size) => {
          file.size = size;
        });
        await GetImageSrc(res.files[0]).then((src) => {
          file.src = src;
        });
        file.blob = res.files[0];
        Vue.set(self.files_, index, file);
        // 立即上传
        if (self.immediate) {
          self.$nextTick(function () {
            self.singleFileChooser.upload(index, self);
          });
        }
      }
    },
    onFileChooserError(error, index, self) {
      const file = self.files_[index];
      file.error.visible = true;
      file.error.message = error.message;
      Vue.set(self.files_, index, file);
    },
    async upload(index, self) {
      if (self.action) {
        const file = self.files_[index];
        file.uploading = true;
        Vue.set(self.files_, index, file);
        const p: IUploaderActionParams = {
          index,
          blob: file.blob,
          src: file.src,
          data: file.data
        };
        await self
          .action(p, self.data)
          .then(function () {
            // 上传成功后 将本地图片赋值给value
            file.value = file.src;
            file.src = '';
          })
          .catch(function (error) {
            file.error.visible = true;
            file.error.message = error.message;
          })
          .finally(function () {
            file.uploading = false;
          });
        Vue.set(self.files_, index, file);
      }
    }
  };

  removeFile(index) {
    const file = this.files_[index];
    if (file.src) {
      file.src = '';
      file.blob = null;
    }
    if (file.value) {
      Vue.set(this.files_, index, file);
    } else {
      this.files_.splice(index, 1);
    }
  }

  validate(): boolean {
    if (this.required) {
      if (this.hasMore) {
        const hasValue = this.files_.some((x) => !!x.value);
        if (!hasValue) {
          this.error.visible = true;
          this.error.message = '请上传文件';
          setTimeout(() => {
            this.error.message = '';
          }, 2000);
        }
        return hasValue;
      } else {
        const hasValue = this.files_.some((x) => !!x.value);
        if (!hasValue) {
          this.files_[0].error.visible = true;
          this.files_[0].error.message = '请上传文件';
          setTimeout(() => {
            this.files_[0].error.visible = false;
          }, 2000);
        }
        return hasValue;
      }
    }
    return true;
  }

  previewImage(index) {
    if (this.files_.length) {
      PreviewImage({
        index: index,
        items: this.files_.map((file) => {
          return {
            src: file.src || file.value,
            miniSrc: file.src || file.value,
            microSrc: file.src || file.value,
            width: file.size.width,
            height: file.size.height
          };
        })
      });
    }
  }

  randomIndex() {
    return Math.floor(Math.random() * this.files_.length);
  }

  add() {
    const _file: IUploaderFile = {
      key: GetGUID(10),
      data: null,
      value: '',
      src:
        'http://rpbd-1257837343.cos.ap-shanghai.myqcloud.com/201911/jx_license_order_doc/d4f02777-02f3-47bb-986c-9353a1ebaa88.jpg',
      blob: null,
      type: IUploaderContentType.image,
      uploading: false,
      error: {
        visible: false,
        message: ''
      },
      size: {
        width: 800,
        height: 800
      }
    };
    // this.files_.splice(this.randomIndex(), 0, _file);
    this.files_.push(_file);
  }

  remove() {
    this.files_.splice(this.randomIndex(), 1);
  }
}
</script>

<style lang="scss" scoped>
.uploader-files {
  position: relative;
  overflow: hidden;

  > li {
    position: relative;
    display: inline-block;
    width: 33.33%;
    padding-bottom: 33.33%;
  }
}

.uploader-file {
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 10px;
  left: 10px;
  padding: 5px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.13);

  &.error {
    border-color: red;
  }

  > dt {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    &[disabled] {
      pointer-events: none;
      cursor: default;
      opacity: 0.6;
    }
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
    cursor: pointer;
  }
}

.uploader-choose {
  width: 100%;
  min-width: auto !important;
  height: 100%;
  border: 1px dashed #ccc;
}

.uploader-remove {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -8px;
  right: -8px;
  width: 26px;
  font-size: 18px;
  height: 26px;
  padding: 2px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #ececec;

  .mu-icon {
    font-size: 12px;
  }
}

.uploader-remove-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #000;
}

.uploader-done {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -8px;
  left: -8px;
  width: 26px;
  height: 26px;
  padding: 2px;
  border-radius: 50%;
  background-color: #ececec;
  cursor: pointer;

  .mu-icon {
    font-size: 12px;
  }
}

.uploader-done-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: green;
}

.uploader-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 12px;
  line-height: 14px;
  max-height: 66px;
  padding: 2px;
  word-break: break-all;
  overflow: hidden;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.1);
  color: red;
  cursor: pointer;
}

.uploader-action {
  position: absolute;
  right: -2px;
  bottom: -2px;

  .mu-button {
    min-width: initial;
    padding: 0;
    vertical-align: top;
  }
}

.uploader-uploading {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);

  .mu-circle-wrapper {
    vertical-align: top;
  }
}
</style>
