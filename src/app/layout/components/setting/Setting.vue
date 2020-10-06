<template>
  <a-drawer
    class="setting"
    title="系统设置"
    width="300"
    placement="right"
    :closable="true"
    :visible.sync="visible"
    @close="onClose"
  >
    <div class="setting-content">
      <!--<setting-item :divider="true">
        <template v-slot:title>整体风格</template>
        <template v-slot:default>
          <div class="setting-block-check">
            <a-tooltip>
              <template slot="title">
                暗色菜单风格
              </template>
              <div class="setting-block-check-item" @click="toggleTheme('dark')">
                <img src="https://gw.alipayobjects.com/zos/rmsportal/LCkqqYNmvBEbokSDscrm.svg" alt="dark" />
                <div class="setting-block-check-icon" v-if="setting.theme === 'dark'">
                  <a-icon type="check" />
                </div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                亮色菜单风格
              </template>
              <div class="setting-block-check-item" @click="toggleTheme('light')">
                <img src="https://gw.alipayobjects.com/zos/rmsportal/jpRkZQMyYRryryPNtyIC.svg" alt="light" />
                <div class="setting-block-check-icon" v-if="setting.theme !== 'dark'">
                  <a-icon type="check" />
                </div>
              </div>
            </a-tooltip>
          </div>
        </template>
      </setting-item>-->
      <setting-item :divider="true">
        <template v-slot:title>主题色</template>
        <template v-slot:default>
          <a-tooltip class="setting-theme-color" v-for="(item, index) in setting.colors" :key="index">
            <template slot="title">
              {{ item.name }}
            </template>
            <a-tag :color="item.code" @click="changeColor(item.code)">
              <a-icon type="check" v-if="item.code === setting.color"></a-icon>
            </a-tag>
          </a-tooltip>
        </template>
      </setting-item>
      <setting-item :divider="true">
        <template v-slot:title>语言</template>
        <template v-slot:default>
          <a-list :split="false">
            <a-list-item>
              <a-select
                slot="actions"
                size="small"
                :defaultValue="setting.language"
                @change="toggleLanguage"
                style="width: 100px;"
              >
                <a-select-option :key="item.value" :value="item.value" v-for="item in languages.arr">{{
                  item.text
                }}</a-select-option>
              </a-select>
              <a-list-item-meta>
                <div slot="title"><v-icon name="globe" scale="1.2" /></div>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </template>
      </setting-item>
    </div>
    <!--<div class="setting-close" @click="toggle" slot="handle">
      <a-icon type="setting" v-if="!visible" />
      <a-icon type="close" v-else />
    </div>-->
  </a-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Drawer, List, Select, Switch, Tag } from 'ant-design-vue';
import '../../../../lib/antdv-ui/icons/globe';

import { Languages } from '../../../i18n';
import { ISettingState, SystemSettingStore } from './store';

import SettingItem from './SettingItem.vue';

Vue.use(Drawer);
Vue.use(List);
Vue.use(Select);
Vue.use(Switch);
Vue.use(Tag);

@Component({
  name: 'Setting',
  components: {
    SettingItem
  }
})
export default class extends Vue {
  @Prop({ default: '' }) title: string;
  @Prop({ default: false }) divider: boolean;

  languages = Languages;

  get setting(): ISettingState {
    return this.$store.getters[SystemSettingStore.getterKeys.setting];
  }

  get visible() {
    return this.setting.visible;
  }

  onClose() {
    this.$store.dispatch(SystemSettingStore.actionKeys.update, {
      visible: false
    });
  }

  toggle() {
    this.$store.dispatch(SystemSettingStore.actionKeys.update, {
      visible: !this.visible
    });
  }

  toggleTheme(val: string) {
    this.$store.dispatch(SystemSettingStore.actionKeys.update, {
      theme: val
    });
  }

  toggleLanguage(val: string) {
    this.$store.dispatch(SystemSettingStore.actionKeys.updateLang, val);
  }

  changeColor(val: string) {
    if (this.setting.color !== val) {
      const closeMessage = this.$message.info(`您选择了主题色 ${val}, 正在切换...`);
      this.$store.dispatch(SystemSettingStore.actionKeys.updateColor, val).then(() => {
        closeMessage();
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-block-check {
  display: flex;
}

.setting-block-check-item {
  position: relative;
  margin-right: 16px;
  cursor: pointer;
  border-radius: 4px;

  img {
    width: 48px;
  }
}

.setting-block-check-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  padding-top: 15px;
  padding-left: 24px;
  font-size: 14px;
  font-weight: 700;
  color: #1890ff;
}

.setting-theme-color {
  display: flex;
  align-items: center;
  justify-content: center;
  float: left;
  width: 20px;
  height: 20px;
  padding-right: 0;
  padding-left: 0;
  margin-right: 8px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  cursor: pointer;
  border-radius: 2px;

  i {
    font-size: 14px;
  }
}

.setting-close {
  position: absolute;
  top: 240px;
  right: 300px;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 16px;
  text-align: center;
  pointer-events: auto;
  cursor: pointer;
  background: #1890ff;
  border-radius: 4px 0 0 4px;

  i {
    font-size: 20px;
    color: rgb(255, 255, 255);
  }
}
</style>
