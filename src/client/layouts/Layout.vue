<template>
  <div class="app-wrapper layout" :class="classObj">
    <div class="app-container">
      <div class="app-top">
        <app-header />
        <visited-tags />
        <div class="app-toolbar">
          <slot name="toolbar" />
        </div>
      </div>
      <div class="app-content">
        <slot />
      </div>
    </div>
    <slot name="append" />
    <sidebar class="vui-mb10" />
    <div class="sidebar-backdrop" v-if="classObj.mobile && sidebarVisible" @click="onBackdropClick" />
    <progress-bar />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';

import ResizeMixin from './mixins/resize';
import { ProgressBar } from './components/progress-bar';
import { Breadcrumb } from './components/breadcrumb';
import { AppHeader } from './components/header';
import { Sidebar } from './components/sidebar';
import { AppFooter } from './components/footer';
import { SidebarStore } from './components/sidebar/store';
import { DeviceType } from '../../models/device';
import VisitedTags from './components/visited-tags/VisitedTags.vue';

@Component({
  name: 'LayoutTable',
  components: {
    VisitedTags,
    AppFooter,
    Sidebar,
    AppHeader,
    Breadcrumb,
    ProgressBar
  }
})
export default class extends mixins(ResizeMixin) {
  get classObj() {
    return {
      'sidebar-hidden': !this.sidebarVisible,
      animation: this.$store.getters[SidebarStore.getterKeys.animation],
      mobile: this.device === DeviceType.mobile
    };
  }

  get sidebarVisible() {
    return this.$store.getters[SidebarStore.getterKeys.visible];
  }

  onBackdropClick() {
    this.$store.dispatch(SidebarStore.actionKeys.close);
  }
}
</script>

<style lang="scss">
@import '../theme/default.theme';

.layout {
  &.app-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;

    &.sidebar-hidden {
      .sidebar {
        width: 0 !important;
      }

      .app-container {
        margin-left: 0;
      }

      .fixed-header {
        width: calc(100% - 54px);
      }
    }

    &.animation {
      .sidebar {
        transition: width 0.28s;
      }

      .app-container {
        transition: margin-left 0.28s;
      }
    }

    &.mobile {
      .app-container {
        margin-left: 0;
      }
    }
  }

  .app-container {
    flex: 1;
    margin-left: 210px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .app-toolbar {
    margin: 10px 10px 0 10px;
    padding: 10px;
    background-color: #fff;
  }

  .app-content {
    margin: 10px;
    overflow: hidden;
  }
}
</style>
