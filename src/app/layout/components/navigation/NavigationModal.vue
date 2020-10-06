<template>
  <as-drawer v-bind="drawer">
    <navigation :collapsed="false" :is-mobile="true" />
  </as-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AsDrawer, CreateAsDrawer } from '../../../../lib/antdv-ui/components/drawer';

import Navigation from './Navigation.vue';

@Component({
  name: 'NavigationModal',
  components: {
    AsDrawer,
    Navigation
  }
})
export default class extends Vue {
  @Prop({ default: false }) collapsed: boolean;

  getContext() {
    return this;
  }

  drawer = CreateAsDrawer({
    getContext: this.getContext,
    props: {
      padding: false,
      closeable: false,
      direction: 'left',
      visible: false
    },
    listeners: {
      visibleChanged(val: boolean) {
        if (val !== this.collapsed) {
          this.$emit('update:collapsed', val);
        }
      }
    }
  });

  @Watch('collapsed', {
    immediate: true
  })
  onCollapsedChange(val: boolean) {
    if (val !== this.drawer.props.visible) {
      this.drawer.props.visible = val;
    }
  }
}
</script>
