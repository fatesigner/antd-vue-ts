<template>
  <a-layout-sider
    class="sidebar"
    v-model="collapsed_"
    :collapsible="collapsible"
    :collapsed-width="collapsedWidth"
    :default-ollapsed="defaultCollapsed"
    :trigger="trigger"
    :width="width"
    :theme="theme"
  >
    <as-scroller class="scroller-wrapper">
      <as-menu class="sidebar-menu" ref="menu" :default-active="defaultActive" :default-openeds="defaultOpeneds">
        <side-menu-item
          :menus="menus"
          :parents="parents"
          :default-opened="true"
          :prefix="prefix"
          :link-active-class="linkActiveClass"
          :link-exact-active-class="linkExactActiveClass"
        />
      </as-menu>
    </as-scroller>
  </a-layout-sider>
</template>

<script lang="ts">
import { Input, Layout, Menu } from 'ant-design-vue';
import { StructureTree } from '@fatesigner/utils/structure-tree';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AsMenu } from '../../../../lib/antdv-ui/components/menu';
import { AsScroller } from '../../../../lib/antdv-ui/components/scroller';

import { ENV } from '../../../global';
import { IMenu } from '../../../interfaces/menu';
import { SessionService } from '../../../services/session.service';

import SideMenuItem from './SideMenuItem.vue';

Vue.use(Layout);
Vue.use(Input);
Vue.use(Menu);

const strutree = new StructureTree<IMenu>();

@Component({
  name: 'Sidebar',
  components: { SideMenuItem, AsMenu, AsScroller }
})
export default class extends Vue {
  @Prop({ default: false }) collapsed: boolean;
  @Prop({ default: false }) collapsible: boolean;
  @Prop({ default: 0 }) collapsedWidth: number;
  @Prop({ default: false }) defaultCollapsed: boolean;
  @Prop({ default: null }) trigger: string;
  @Prop({ default: 210 }) width: number;
  @Prop({ default: null }) theme: string;

  menus: IMenu[] = [];
  defaultActive: string = null;
  defaultOpeneds: string[] = [];
  defaultSelectedKeys: string[] = [];
  defaultOpenKeys: string[] = [];
  parents: any[] = [];
  prefix: string;
  linkActiveClass: string;
  linkExactActiveClass: string;
  title = ENV.VUE_APP_TITLE;
  searchInput = '';
  searchMenus: any[] = [];

  get collapsed_() {
    return this.collapsed;
  }

  set collapsed_(val) {
    this.$emit('update:collapsed', val);
  }

  @Watch('searchInput')
  onSearchInputWatch(val: string) {
    if (val) {
      this.searchMenus = strutree.reduce(
        this.menus,
        (prev, cur) => {
          if (cur.url && cur.label.indexOf(val) > -1) {
            prev.push(cur);
          }
          return prev;
        },
        []
      );
    } else {
      this.searchMenus = [];
    }
  }

  created() {
    this.prefix = (this.$router as any).options.mode === 'hash' ? '#' : (this.$router as any).options.base;
    this.linkActiveClass = (this.$router as any).options.linkActiveClass;
    this.linkExactActiveClass = (this.$router as any).options.linkExactActiveClass;

    this.menus = SessionService.user.menus;

    // 默认展开所有一级菜单
    this.defaultOpeneds = this.menus.map((x: any) => x.id);

    const cur = strutree.find(this.menus, (x) => x.url === this.$route.path);
    if (cur) {
      this.defaultActive = cur.node.id;
      this.parents = cur.parentNodes.map((x: any) => x.id);
    }
  }

  menuClick(item: any) {
    if (this.$route.name !== item.name) {
      this.$router.push(item.url);
    }
    this.searchMenus = [];
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .as-menu {
    border-right: none;
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }

  .as-scroller__wrap {
    overflow-x: hidden;
  }

  .scroller-wrapper {
    height: 100%;
  }
}

.sidebar {
  background-color: transparent;

  .ant-menu {
    background-color: transparent;
  }

  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background-color: #ececec;
    box-shadow: inset 0 1px 10px 0 rgba(154, 161, 171, 0.2);
  }
}

.sidebar-menu {
  min-width: 210px;
  padding: 15px;
}

.ant-menu-submenu {
  .ant-menu-sub {
    padding-left: 10px;

    &::before {
      position: absolute;
      top: 0;
      left: 20px;
      width: 3px;
      height: 100%;
      content: '';
      background: #e0f3ff;
      border-radius: 15px;
      opacity: 1;
    }
  }

  > a {
    border-radius: 5px;
  }

  .ant-menu-item.ant-menu-item-selected {
    color: #303133;
  }

  .ant-menu-submenu-title {
    min-width: inherit;
    height: inherit;
    padding: 0 10px !important;
    margin: 5px 0;
    line-height: 32px;
    border-radius: 3px;
  }

  a {
    display: block;
  }
}
</style>
