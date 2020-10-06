<template>
  <canvas @click="reloadPic" :width="contentWidth" :height="contentHeight"></canvas>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'GraphicCode'
})
export default class extends Vue {
  @Prop({ default: 4 }) length: number;
  @Prop({ default: 20 }) fontSizeMin: number;
  @Prop({ default: 45 }) fontSizeMax: number;
  @Prop({ default: 180 }) backgroundColorMin: number;
  @Prop({ default: 240 }) backgroundColorMax: number;
  @Prop({ default: 50 }) colorMin: number;
  @Prop({ default: 160 }) colorMax: number;
  @Prop({ default: 40 }) lineColorMin: number;
  @Prop({ default: 180 }) lineColorMax: number;
  @Prop({ default: 0 }) dotColorMin: number;
  @Prop({ default: 255 }) dotColorMax: number;
  @Prop({ default: 136 }) contentWidth: number;
  @Prop({ default: 38 }) contentHeight: number;

  code = '';

  // 生成一个随机数
  randomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // 生成一个随机的颜色
  randomColor(min: number, max: number) {
    const r = this.randomNum(min, max);
    const g = this.randomNum(min, max);
    const b = this.randomNum(min, max);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  drawPic() {
    this.randomCode();
    const canvas: any = this.$el;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'bottom';
    // 绘制背景
    ctx.fillStyle = this.randomColor(this.backgroundColorMin, this.backgroundColorMax);
    ctx.fillRect(0, 0, this.contentWidth, this.contentHeight);
    // 绘制文字
    for (let i = 0; i < this.code.length; i++) {
      this.drawText(ctx, this.code[i], i);
    }
    this.drawLine(ctx);
    this.drawDot(ctx);
    this.$emit('graphChange', this.code);
  }

  drawText(ctx: any, txt: string, i: number) {
    ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax);
    const fontSize = this.randomNum(this.fontSizeMin, this.fontSizeMax);
    ctx.font = fontSize + 'px SimHei';
    const padding = 10;
    const offset = (this.contentWidth - 40) / (this.code.length - 1);
    let x = padding;
    if (i > 0) {
      x = padding + i * offset;
    }
    // let x = (i + 1) * (this.contentWidth / (this.code.length + 1))
    let y = this.randomNum(this.fontSizeMax, this.contentHeight - 5);
    if (fontSize > 40) {
      y = 40;
    }
    const deg = this.randomNum(-10, 10);
    // 修改坐标原点和旋转角度
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(txt, 0, 0);
    // 恢复坐标原点和旋转角度
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
  }

  drawLine(ctx: any) {
    // 绘制干扰线
    for (let i = 0; i < 1; i++) {
      ctx.strokeStyle = this.randomColor(this.lineColorMin, this.lineColorMax);
      ctx.beginPath();
      ctx.moveTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight));
      ctx.lineTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight));
      ctx.stroke();
    }
  }

  drawDot(ctx: any) {
    // 绘制干扰点
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = this.randomColor(0, 255);
      ctx.beginPath();
      ctx.arc(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight), 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  reloadPic() {
    this.drawPic();
  }

  randomCode() {
    let random = '';
    // 去掉了I l o O
    const str = 'QWERTYUPLKJHGFDSAZXCVBNMqiwertyupkjhgfdsazxcvbnm1234567890';
    for (let i = 0; i < this.length; i++) {
      const index = Math.floor(Math.random() * 58);
      random += str[index];
    }
    this.code = random;
  }

  mounted() {
    this.drawPic();
  }
}
</script>
