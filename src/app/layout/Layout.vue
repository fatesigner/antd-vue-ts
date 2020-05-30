<template>
  <div class="app-wrapper layout" :class="classObj">
    <div class="app-top">
      <app-header />
      <visited-tags />
    </div>
    <div class="app-container">
      <div class="app-toolbar" v-if="$scopedSlots['toolbar']">
        <slot name="toolbar" />
      </div>
      <slot />
    </div>
    <slot name="append" />
    <sidebar class="vui-mb10" />
    <div class="sidebar-backdrop" v-if="classObj.mobile && sidebarVisible" @click="onBackdropClick" />
    <progress-bar />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import { AppStore } from '../store';
import { DeviceType } from '../interfaces/device';
import { ProgressBar } from './components/progress-bar';
import { Breadcrumb } from './components/breadcrumb';
import { AppHeader } from './components/header';
import { Sidebar } from './components/sidebar';
import { AppFooter } from './components/footer';
import { SidebarStore } from './components/sidebar/store';
import { VisitedTags } from './components/visited-tags';
import { ApplyBind, Debounce } from '@forgleaner/utils';

// refer to Bootstrap's responsive design
const WIDTH = 666;

@Component({
  name: 'Layout',
  components: {
    VisitedTags,
    AppFooter,
    Sidebar,
    AppHeader,
    Breadcrumb,
    ProgressBar
  }
})
export default class extends Vue {
  get classObj() {
    return {
      'sidebar-hidden': !this.sidebarVisible,
      animation: this.$store.getters[SidebarStore.getterKeys.animation],
      mobile: this.device === DeviceType.mobile
    };
  }

  get device() {
    return this.$store.getters[AppStore.getterKeys.device];
  }

  get sidebarVisible() {
    return this.$store.getters[SidebarStore.getterKeys.visible];
  }

  @Watch('$route')
  onRouteChange() {
    if (this.device === DeviceType.mobile && this.sidebarVisible) {
      return this.$store.dispatch(SidebarStore.actionKeys.toggle);
    }
  }

  onBackdropClick() {
    this.$store.dispatch(SidebarStore.actionKeys.close);
  }

  isMobile() {
    const rect = document.body.getBoundingClientRect();
    return rect.width - 1 < WIDTH;
  }

  private resizeHandler = Debounce(
    ApplyBind(function () {
      if (!document.hidden) {
        const isMobile = this.isMobile();
        this.$store.dispatch(AppStore.actionKeys.toggleDevice, isMobile ? DeviceType.mobile : DeviceType.desktop);
        if (isMobile) {
          return this.$store.dispatch(SidebarStore.actionKeys.close);
        } else {
          return this.$store.dispatch(SidebarStore.actionKeys.open);
        }
      }
    }, this),
    300,
    false
  );

  beforeMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  mounted() {
    console.log('layout mounted');
    const isMobile = this.isMobile();
    if (isMobile) {
      this.$store.dispatch(AppStore.actionKeys.toggleDevice, DeviceType.mobile);
      this.$store.dispatch(SidebarStore.actionKeys.close, false);
    } else {
      this.$store.dispatch(SidebarStore.actionKeys.open, false);
    }
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
</script>

<style lang="scss">
@import '../../theme/default.theme';

.layout {
  &.app-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin-left: 210px;
    overflow-x: hidden;
    overflow-y: auto;

    &.sidebar-hidden {
      margin-left: 0;

      .sidebar {
        width: 0 !important;
      }

      .fixed-header {
        width: calc(100% - 54px);
      }
    }

    &.animation {
      transition: margin-left 0.28s;

      .sidebar {
        transition: width 0.28s;
      }
    }

    &.mobile {
      margin-left: 0;
    }
  }

  .app-toolbar {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #fff;
  }

  .app-container {
    position: relative;
    flex: 1;
    padding: 10px;
    overflow-x: auto;
    overflow-y: auto;
  }
}
</style>
