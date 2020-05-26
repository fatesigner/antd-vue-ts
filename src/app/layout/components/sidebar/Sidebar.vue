<template>
  <div class="sidebar">
    <el-scrollbar class="scrollbar-wrapper">
      <el-menu :default-openeds="parents" :unique-opened="false">
        <side-menu-item
          :menus="menus"
          :parents="parents"
          :default-opened="true"
          :prefix="prefix"
          :link-active-class="linkActiveClass"
          :link-exact-active-class="linkExactActiveClass"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Strutree } from '../../../../lib/strutree/strutree';

import { IMenu } from '../../../interfaces/memu';
import SideMenuItem from './SideMenuItem.vue';
import { TransitionCollapse } from '../../../shared/transition';
import { SidebarStore } from './store';

const strutree = new Strutree<IMenu>({
  applyFunc(items, index, item) {
    Vue.set(items, index, item);
  }
});

@Component({
  name: 'Sidebar',
  components: { SideMenuItem, TransitionCollapse }
})
export default class extends Vue {
  menus: IMenu[] = [];
  parents = [];
  prefix: string;
  linkActiveClass: string;
  linkExactActiveClass: string;

  get sidebarVisible() {
    return this.$store.getters[SidebarStore.getterKeys.visible];
  }

  set sidebarVisible(val: boolean) {
    this.$store.dispatch(SidebarStore.actionKeys.toggle);
  }

  created() {
    this.prefix = (this.$router as any).options.mode === 'hash' ? '#' : '';
    this.linkActiveClass = (this.$router as any).options.linkActiveClass;
    this.linkExactActiveClass = (this.$router as any).options.linkExactActiveClass;
  }

  mounted() {
    // 获取菜单
    const menus = require('../../../../assets/json/system-menus.json');
    const activePath = this.$route.matched.pop().path || '/';
    const node = strutree.find(menus, (x) => x.url === activePath);
    if (node) {
      this.parents = node.parentNodes.map((x) => x.id);
    } else {
      this.parents = [];
    }
    this.menus = menus;
  }
}
</script>

<style lang="scss">
.sidebar {
  position: fixed;
  z-index: 1001;
  top: 0;
  bottom: 0;
  left: 0;
  width: 210px !important;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.scrollbar-wrapper {
  height: 100%;
}

.sidebar-backdrop {
  position: absolute;
  z-index: 999;
  background-color: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
}
</style>
