<template>
  <div class="simulator-wrapper">
    <div
      class="simulator-content"
      ref="container"
      :style="{ width: width + 'px', height: height + 'px' }"
      @scroll="onScroll"
    >
      <as-scroller class="simulator-scroller">
        <div
          ref="inner"
          :style="{
            fontSize: deviceFontSize + 'px',
            transform: `scale(${scale})`,
            transformOrigin: `left top`,
            width: deviceWidth + 'px',
            height: deviceHeight + 'px'
          }"
        >
          <slot />
        </div>
      </as-scroller>
    </div>
    <div class="simulator-toolbar">
      <i v-if="deviceSetable" type="ios-cog" class="icon-btn" @click.stop="showSetting = true" />
      <a-button class="btn-refresh" v-else type="link" @click="reRender()">
        <v-icon name="sync" scale=".9" />
      </a-button>
      <slot name="right-simulator-toolbar"></slot>
    </div>
    <div class="simulator-form" v-show="showSetting" @click.stop>
      <label>
        显示宽度：
        <input v-model="inW" placeholder="默认350" />
      </label>
      <br />
      <label>
        设备宽度：
        <input v-model="inDW" placeholder="默认1200" />
      </label>
      <label>
        设备高度：
        <input v-model="inDH" placeholder="默认1920" />
      </label>
      <label>
        像素比率：
        <input v-model="inPR" placeholder="默认2" />
      </label>
      <label>
        设备字号（基于css像素）：
        <input v-model="inFontSize" placeholder="默认16" />
      </label>
      <button size="small" @click="reRender()">重新渲染</button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { AsScroller } from '../scroller';

const CACHE_CONFIG_KEY = 'enne5w4-mobile-preview-setting-config';

@Component({
  name: 'MobileSimulator',
  components: { AsScroller }
})
export default class extends Vue {
  @Prop({ default: false }) deviceSetable: boolean;

  deviceFontSize = 16;
  width = 350;
  height = 0;
  deviceWidth = 1200;
  deviceHeight = 1920;

  inW = '';
  inDW = '';
  inDH = '';
  inPR = '';
  inFontSize = '';

  scale = 1;
  showSetting = false;
  maxScroll = 0;

  beforeMount() {
    let conf: any = localStorage.getItem(CACHE_CONFIG_KEY);
    if (conf) {
      conf = JSON.parse(conf);
      this.inDW = conf.dw;
      this.inDH = conf.dh;
      this.inW = conf.w;
      this.inPR = conf.pr;
      this.inFontSize = conf.font;
    }
    this.reRender();
    window.addEventListener('click', this.closeFn);
  }

  beforeDestroy() {
    window.removeEventListener('click', this.closeFn);
    localStorage.setItem(
      CACHE_CONFIG_KEY,
      JSON.stringify({
        dw: this.inDW,
        dh: this.inDH,
        w: this.inW,
        pr: this.inPR,
        font: this.inFontSize
      })
    );
  }

  onScroll(e) {
    if (e.target.scrollTop > this.maxScroll) {
      e.target.scrollTop = this.maxScroll;
    }
  }

  reRender() {
    // step1: 由输入生成参数
    this.deviceHeight = (+this.inDH || 1920) / (+this.inPR || 2);
    this.deviceWidth = (+this.inDW || 1200) / (+this.inPR || 2);
    this.width = +this.inW || 350;
    this.deviceFontSize = +this.inFontSize || 16;
    // step2：校验适配，避免异常情况
    if (this.deviceWidth < 100) {
      this.deviceWidth = 100;
    }
    if (this.deviceHeight < 100) {
      this.deviceHeight = 100;
    }
    // 预览宽度比实际宽度：只能缩小，不能放大：
    if (this.width > this.deviceWidth) {
      this.width = this.deviceWidth;
    }

    // step3：开始计算：
    this.height = (this.width * this.deviceHeight) / this.deviceWidth;
    this.scale = this.width / this.deviceWidth;
    this.$emit('change-screen', {
      width: this.deviceWidth,
      height: this.deviceHeight
    });

    setTimeout(() => {
      if ((this.$refs?.inner as any)?.scrollHeight) {
        this.maxScroll = (this.$refs.inner as any).scrollHeight * this.scale - this.height;
      }
    }, 500);
  }

  closeFn(e) {
    if (this.showSetting) {
      this.showSetting = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }
}
</script>
<style lang="scss" scoped>
$rightBorder: 41px;

.simulator-wrapper {
  position: relative;
  display: inline-block;
  width: min-content;
}

.simulator-scroller {
  height: 100%;
}

.simulator-content {
  box-sizing: content-box;
  overflow-x: hidden;
  overflow-y: hidden;
  background: white;
  border-color: #333;
  border-style: solid;
  border-width: 39px $rightBorder 46px 42px;
  border-radius: 20px;
  box-shadow: 0 0 3px black, 0 0 16px black, 0 0 23px black, 0 0 2px 4px white, 0 0 1px 5px black;

  &::-webkit-scroller {
    width: 0;
  }
}

.simulator-toolbar {
  z-index: 99;
  margin-left: -$rightBorder;
  width: $rightBorder;
  position: absolute;
  right: 0;
  top: 0;
  background: transparent;

  .a-button--text {
    color: #aaa;

    &:hover {
      color: #999;
      background-color: transparent;
      border-color: transparent;
    }
  }

  .icon-btn {
    color: #aaa;
    font-size: 18px;
    margin: 10px auto auto 10px;
    cursor: pointer;
  }

  .icon-btn:hover {
    color: #e1e1e1;
  }
}

/* 表单 */
.simulator-form {
  text-align: left;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;

  width: 17em;
  font-size: 12px;
  color: #bbb;

  position: absolute;
  left: 100%;
  top: 0;
  z-index: 999;

  margin: 12px 0 0 6px;
  padding: 2em;

  display: flex;
  flex-flow: column;
  input {
    color: #eee;
    border: 1px solid #aaa;
    border-width: 0 0 1px;
    background: none;
    outline: none;
  }
  input::placeholder {
    color: #bbb;
  }
  label {
    margin-bottom: 0.5em;
  }
  button {
    width: 5.5em;
    margin: 1em auto 0;
    background: rgba(255, 255, 255, 0.18);
    border: none;
    outline: none;
    box-shadow: none;
    color: #eee;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

.simulator-scroller {
  ::v-deep .as-scroller__wrap {
    overflow-x: hidden;
  }
}

.btn-refresh {
  padding: 10px;
  color: #aaa;
}
</style>
