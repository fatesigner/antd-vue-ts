<template>
  <span class="interval-action" v-show="!loading">
    <span>{{ seconds_ }}s</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'IntervalAction'
})
export default class extends Vue {
  @Prop({ default: 30 }) seconds: number;
  @Prop({ default: null, type: [Object, Promise, Function] }) handler: (...args: any) => Promise<void>;

  seconds_ = 30;

  loading = false;

  interval: any;

  created() {
    this.reset();
  }

  mounted() {}

  sleep() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.seconds_ = this.seconds;
  }

  resume() {
    if (!this.interval) {
      this.interval = setInterval(async () => {
        if (this.seconds_ > 1) {
          this.seconds_--;
        } else {
          if (!this.loading) {
            if (this.handler) {
              this.loading = true;
              await this.handler();
              this.loading = false;
            }
            this.seconds_ = this.seconds;
          }
        }
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
.interval-action {
  padding: 2px;
  font-size: 12px;
  color: #999;
  letter-spacing: 2px;
}

img {
  max-width: 100%;
}
</style>
