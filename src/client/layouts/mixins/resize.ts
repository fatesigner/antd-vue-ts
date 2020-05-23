/**
 * resize
 */

import { Component, Vue, Watch } from 'vue-property-decorator';
import { ApplyBind, Debounce } from '@forgleaner/utils';

import { AppStore } from '../../store';
import { SidebarStore } from '../components/sidebar/store';
import { DeviceType } from '../../../models/device';

// refer to Bootstrap's responsive design
const WIDTH = 996;

@Component({
  name: 'ResizeMixin'
})
export default class extends Vue {
  get device() {
    return this.$store.getters[AppStore.getterKeys.device];
  }

  get sidebar() {
    return this.$store.getters[SidebarStore.getterKeys.visible];
  }

  @Watch('$route')
  private onRouteChange() {
    if (this.device === DeviceType.mobile && this.sidebar.opened) {
      return this.$store.dispatch(SidebarStore.actionKeys.toggle);
    }
  }

  beforeMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  mounted() {
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

  private isMobile() {
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
          // return this.$store.dispatch(SidebarStore.actionKeys.open);
        }
      }
    }, this),
    300,
    false
  );
}
