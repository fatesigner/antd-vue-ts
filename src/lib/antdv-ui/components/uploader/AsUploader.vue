<template>
  <div class="uploader">
    <!--<button @click="add">add</button>
    <button @click="remove">remove</button>-->
    <transition-group name="transition-group-zoom-xy" tag="ul" class="uploader-files">
      <li
        v-for="(file, index) of filesCur"
        :key="file.key"
        :style="{ width: width + 'px', 'padding-bottom': width + 'px' }"
      >
        <dl class="uploader-file">
          <dt v-if="readonly" title="点击查看大图" @click="previewImage(index)">
            <img :src="file.src_temp || file.src" alt="" />
          </dt>
          <template v-else>
            <dt
              :title="file.error.message || '选择文件'"
              :disabled="file.uploading"
              v-file-chooser="getSingleFileChooserOptions(file)"
              @fileChooserChange="singleFileChooser.onFileChooserChange($event, index, currentContext)"
              @fileChooserError="singleFileChooser.onFileChooserError($event, index, currentContext)"
            >
              <img :src="file.src_temp || file.src" alt="" />
            </dt>
            <dd class="uploader-status" v-if="file.uploading"></dd>
            <transition-slide>
              <dd class="uploader-error" v-if="!file.uploading && file.error.visible" :title="file.error.message">
                {{ file.error.message }}
              </dd>
            </transition-slide>
            <transition-zoom>
              <dd class="uploader-warning" v-if="!file.uploading && file.error.visible" :title="file.error.message">
                <span class="uploader-warning-in"><a-icon type="warning" /></span>
              </dd>
            </transition-zoom>
            <transition-zoom>
              <dd class="uploader-done" v-if="!file.uploading && file.src && !file.src_temp" title="已上传">
                <span class="uploader-done-in"><a-icon type="check" /></span>
              </dd>
            </transition-zoom>
            <dd class="uploader-action" v-if="!file.uploading && file.src && !file.src_temp">
              <a-button
                class="btn-viewer"
                size="small"
                title="查看大图"
                type="primary"
                icon="eye"
                @click="previewImage(index)"
              />
            </dd>
            <transition-zoom>
              <dd
                class="uploader-remove"
                v-if="!file.uploading && ((deletable && file.src) || file.src_temp)"
                @click="removeFile(file, index)"
                :title="file.src ? '取消' : '删除'"
              >
                <div class="cross-icon"></div>
              </dd>
            </transition-zoom>
            <dd class="uploader-uploading" v-if="file.uploading">
              <as-loading size="large" />
            </dd>
            <transition-zoom>
              <dd class="uploader-action" v-if="!file.uploading && file.src_temp && action">
                <a-button size="small" title="开始上传" type="primary" :loading="file.uploading" @click="upload(index)"
                  >上传
                </a-button>
              </dd>
            </transition-zoom>
          </template>
        </dl>
      </li>
      <li v-if="hasMore" :key="-1" :style="{ width: width + 'px', 'padding-bottom': width + 'px' }">
        <dl class="uploader-file" :class="{ error: error.visible }">
          <transition-slide>
            <dd class="uploader-error" v-if="error.message" :title="error.message">
              <a-icon type="warning" />{{ error.message }}
            </dd>
          </transition-slide>
          <a-button
            class="uploader-choose"
            flat
            color="#999"
            title="选择文件"
            v-file-chooser="getFileChooserOptions()"
            @fileChooserChange="fileChooser.onFileChooserChange($event, currentContext)"
            @fileChooserError="fileChooser.onFileChooserError($event, currentContext)"
          >
            <a-icon type="plus" size="36" />
          </a-button>
        </dl>
      </li>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { GetGUID } from '@fatesigner/utils/random';
import { ImgViewer } from '@fatesigner/img-viewer';
import { GetImageSize, GetImageSrc } from '@fatesigner/utils/document';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { IFileChooserChangeResponse } from '@fatesigner/file-chooser/interfaces';
import { TransitionSlide, TransitionZoom } from '@fatesigner/vue-lib/components/transition';
import { FileChooserDirectiveForVue } from '@fatesigner/file-chooser/directives/file-chooser.directive';

import { AsLoading } from '../loading';

import { IAsUploaderActionParams, IAsUploaderContentType, IAsUploaderFile } from './interfaces';

Vue.use(FileChooserDirectiveForVue);

interface IAsUploaderFileExtend extends IAsUploaderFile {
  key: string;
  src_temp: string;
  uploading: boolean;
  contentType: IAsUploaderContentType;
  error: {
    visible: boolean;
    message: string;
  };
}

@Component({
  name: 'AsUploader',
  components: {
    TransitionSlide,
    TransitionZoom,
    AsLoading
  }
})
export default class extends Vue {
  @Prop({ default: (): any[] => [] }) files: IAsUploaderFile[];
  @Prop({ default: null, type: [Object, Promise, Function] }) action: Promise<any>;
  @Prop({ default: null }) data: any;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) immediate: boolean;
  @Prop({ default: false }) multiple: boolean;
  @Prop({ default: false }) parallel: boolean;
  @Prop({ default: false }) required: boolean;
  @Prop({ default: true }) deletable: boolean;
  @Prop({ default: 1000 }) maxCount: number;
  @Prop({ default: 10 * 1024 }) maxSize: number;
  @Prop({ default: 128 }) width: number;

  get currentContext() {
    return this;
  }

  files_: IAsUploaderFile[] = [];
  filesCur: IAsUploaderFileExtend[] = [];
  error = {
    visible: false,
    message: ''
  };

  get hasMore() {
    return !this.readonly && (this.maxCount <= 0 || this.filesCur.length < this.maxCount);
  }

  @Watch('files', {
    immediate: true
  })
  onFilesChange(val: IAsUploaderFile[]) {
    if (this.files_ != val) {
      this.files_ = val;
      this.filesCur = this.files_.map((x) =>
        Object.assign(
          {
            key: GetGUID(12),
            size: {
              width: 0,
              height: 0
            }
          },
          x,
          {
            src_temp: '',
            uploading: false,
            contentType: IAsUploaderContentType.image,
            error: {
              visible: false,
              message: ''
            }
          }
        )
      );
    }
  }

  @Emit('update:files')
  emitUpdateFiles() {
    this.files_ = this.filesCur.map((x: any) => ({
      src: x.src,
      file: x.file,
      size: x.size,
      data: x.data
    }));
    return this.files_;
  }

  @Emit('failed')
  emitFailed(error: Error) {}

  fileChooser = {
    async onFileChooserChange(res: IFileChooserChangeResponse, currentContext: any) {
      if (res.files.length) {
        if (
          currentContext.maxCount &&
          currentContext.maxCount > 0 &&
          res.files.length + currentContext.filesCur.length > currentContext.maxCount
        ) {
          currentContext.emitFailed(new Error(`限制上传${currentContext.maxCount}张`));
        } else {
          const index = currentContext.filesCur.length;
          for (const file of res.files) {
            const _file: IAsUploaderFileExtend = {
              key: GetGUID(12),
              data: {},
              src_temp: '',
              src: '',
              file: file,
              contentType: IAsUploaderContentType.image,
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
              _file.src_temp = src;
            });
            currentContext.filesCur.push(_file);
          }
          // 立即上传
          if (currentContext.immediate) {
            setTimeout(async () => {
              for (let i = index; i < currentContext.filesCur.length; i++) {
                if (currentContext.parallel) {
                  currentContext.upload(i);
                } else {
                  await currentContext.upload(i);
                }
              }
            }, 500);
          }
          currentContext.emitUpdateFiles();
        }
      }
    },
    onFileChooserError(error: Error, currentContext: any) {
      currentContext.emitFailed(error);
    }
  };

  getFileChooserOptions() {
    return {
      id: GetGUID(12),
      maxCount: this.maxCount,
      multiple: this.multiple,
      maxSize: this.maxSize,
      compress: {
        quality: 0.6
      }
    };
  }

  getSingleFileChooserOptions(file: any) {
    return {
      id: file.key || GetGUID(12),
      maxCount: 1,
      multiple: this.multiple,
      maxSize: this.maxSize,
      compress: {
        quality: 0.6
      }
    };
  }

  singleFileChooser = {
    options: {
      id: GetGUID(12),
      maxCount: 1,
      multiple: false,
      maxSize: 10 * 1024,
      compress: {
        quality: 0.6
      }
    },
    async onFileChooserChange(res: IFileChooserChangeResponse, index: number, currentContext: any) {
      if (res.files.length) {
        const file = currentContext.filesCur[index];
        // 获取图片尺寸
        await GetImageSize(res.files[0]).then((size) => {
          file.size = size;
        });
        await GetImageSrc(res.files[0]).then((src) => {
          file.src_temp = src;
        });
        file.file = res.files[0];
        Vue.set(currentContext.filesCur, index, file);
        // 立即上传
        if (currentContext.immediate) {
          currentContext.$nextTick(function () {
            currentContext.upload(index);
          });
        }
        currentContext.emitUpdateFiles();
      }
    },
    onFileChooserError(error: Error, index: number, currentContext: any) {
      const file = currentContext.filesCur[index];
      file.error.visible = true;
      file.error.message = error.message;
      Vue.set(currentContext.filesCur, index, file);
    }
  };

  async upload(index: number) {
    if (this.action) {
      const file = this.filesCur[index];
      file.uploading = true;
      Vue.set(this.filesCur, index, file);
      const p: IAsUploaderActionParams = {
        index,
        file: file.file,
        src: file.src,
        data: file.data
      };
      await (this.action as any)(p, this.data)
        .then(function () {
          // 上传成功后 将本地图片赋值给 src_temp
          file.src = file.src_temp;
          file.src_temp = '';
        })
        .catch(function (error: Error) {
          file.error.visible = true;
          file.error.message = error.message;
        })
        .finally(() => {
          file.uploading = false;
          this.emitUpdateFiles();
        });
      Vue.set(this.filesCur, index, file);
    }
  }

  removeFile(file: any, index: number) {
    if (file.src_temp && file.src) {
      file.src_temp = '';
      file.file = null;
      Vue.set(this.filesCur, index, file);
    } else {
      this.filesCur.splice(index, 1);
    }
    this.emitUpdateFiles();
  }

  validate(): boolean {
    if (this.required) {
      if (this.hasMore) {
        const hasValue = this.filesCur.some((x) => !!x.src);
        if (!hasValue) {
          this.error.visible = true;
          this.error.message = '请上传文件';
          setTimeout(() => {
            this.error.message = '';
          }, 2000);
        }
        return hasValue;
      } else {
        const hasValue = this.filesCur.some((x) => !!x.src);
        if (!hasValue) {
          this.filesCur[0].error.visible = true;
          this.filesCur[0].error.message = '请上传文件';
          setTimeout(() => {
            this.filesCur[0].error.visible = false;
          }, 2000);
        }
        return hasValue;
      }
    }
    return true;
  }

  previewImage(index: number) {
    if (this.filesCur.length) {
      ImgViewer.present({
        index: index,
        items: this.filesCur.map((file) => {
          return {
            src: file.src_temp || file.src
            // miniSrc: file.src_temp || file.src,
            // microSrc: file.src_temp || file.src,
            // width: file.size.width,
            // height: file.size.height
          };
        })
      });
    }
  }

  randomIndex() {
    return Math.floor(Math.random() * this.filesCur.length);
  }

  add() {
    const _file: IAsUploaderFileExtend = {
      key: GetGUID(12),
      data: null,
      src_temp: '',
      src: '',
      file: null,
      contentType: IAsUploaderContentType.image,
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
    // this.filesCur.splice(this.randomIndex(), 0, _file);
    this.filesCur.push(_file);
  }

  remove() {
    this.filesCur.splice(this.randomIndex(), 1);
  }
}
</script>

<style lang="scss" scoped>
.uploader-files {
  position: relative;
  margin: -10px;
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
  cursor: pointer;
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
    cursor: pointer;

    &[disabled] {
      pointer-events: none;
    }
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
  }
}

.cross-icon {
  position: relative;
  width: 100%;
  height: 100%;
  transition-duration: 0.5s;
  transition-property: opacity, transform;
  transform: translate3d(0, 0, 0) rotate(135deg);

  &::before,
  &::after {
    position: absolute;
    display: block;
    content: '';
    background-color: #999;
    transition-timing-function: ease;
    transition-duration: 0.15s;
    transition-property: transform;
  }

  &::before {
    top: 50%;
    width: 100%;
    height: 1px;
    transform: translate3d(0, -50%, 0);
  }

  &::after {
    left: 50%;
    width: 1px;
    height: 100%;
    transform: translate3d(-50%, 0, 0);
  }
}

.uploader-choose {
  width: 100%;
  min-width: auto !important;
  height: 100%;
  color: #bbb;
  border: 1px dashed #ccc;
  border-radius: 0;
}

.uploader-remove {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ddb5b5;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13);

  &:hover {
    .cross-icon {
      opacity: 0.7;
      transform: translate3d(0, 0, 0) rotate(-65deg);
    }
  }
}

.uploader-remove-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;

  > i {
    font-size: 12px;
    transform: scale(0.9);
  }
}

.remove-container {
  border-radius: 50%;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.uploader-warning {
  position: absolute;
  top: -5px;
  left: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ffd8d8;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13);
}

.uploader-warning-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;

  > i {
    font-size: 12px;
    font-weight: bold;
    color: red;
  }
}

.uploader-done {
  position: absolute;
  top: -5px;
  left: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 2px;
  cursor: pointer;
  background-color: #52c41a;
  border: 1px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13);
}

.uploader-done-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;

  > i {
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    transform: scale(0.9);
  }
}

.uploader-error {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  max-height: 100%;
  padding: 2px 2px 2px 12px;
  overflow: hidden;
  font-size: 12px;
  font-style: italic;
  line-height: 14px;
  color: #ffa2a2;
  word-break: break-all;
  pointer-events: none;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
}

.uploader-action {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;

  ::v-deep .ant-btn {
    display: inline-block;
    height: 20px;
    padding: 2px;
    font-size: 12px;
    line-height: 12px;
    color: #fff;
    background-color: #f67828;
    border-color: #f67828;

    &:hover,
    &:focus {
      background-color: rgba(#f67828, 0.7);
      border-color: rgba(#f67828, 0.7);
    }

    &:active,
    &.active {
      background-color: rgba(#f67828, 0.5);
      border-color: rgba(#f67828, 0.5);
    }

    &[disabled] {
      color: #fff;
      background-color: rgba(#f67828, 0.2);
      border-color: rgba(#f67828, 0.2);
    }
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
}

.btn-viewer {
  width: 18px;
  height: 18px;
  line-height: 14px;

  ::v-deep .anticon {
    font-size: 12px;
  }
}
</style>

<style lang="scss">
.transition-group-zoom-xy-enter-active,
.transition-group-zoom-xy-leave-active,
.transition-group-zoom-xy-move {
  transition: 300ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}

.transition-group-zoom-xy-enter,
.transition-group-zoom-xy-leave-to {
  opacity: 0;
  transform: scaleX(0.2) scaleY(0.2);
  transform-origin: 20% 50%;
}

.transition-group-zoom-xy-leave,
.transition-group-zoom-xy-enter-to {
  opacity: 1;
  transform: scaleX(1) scaleY(1);
  transform-origin: 20% 50%;
}

.transition-group-zoom-xy-leave-active {
  position: absolute !important;
}
</style>
