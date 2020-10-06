<template>
  <div class="skeleton">
    <div class="lattice" v-for="item in Array.from(Array(rows)).keys()" :key="item + 1"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'AsSkeletonForm'
})
export default class extends Vue {
  @Prop({ default: 6 }) rows: number;
}
</script>

<style lang="scss">
@keyframes skeleton-stripes {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>

<style lang="scss" scoped>
.skeleton {
  background-color: #eaeaea;
  background-image: linear-gradient(to left, #f6f7f8 25%, #edeef1 37%, #f6f7f8 62%, #f6f7f8 63%);
  background-position: 100% 50%;
  background-size: 400% 100%;
  animation: skeleton-stripes 1s ease infinite;
}

.lattice {
  height: 24px;
  background-color: #fff;

  &:nth-child(2n + 1) {
    width: 30px;
    height: 39px;
    margin-left: 100px;
  }
}
</style>
