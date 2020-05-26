<template>
  <layout>
    <dl class="http401-container">
      <dt>
        <el-button icon="el-icon-arrow-left" class="back-btn" @click="back">
          返回
        </el-button>
        <h1 class="text-jumbo text-ginormous">
          Oops!
        </h1>
        <h2>你没有权限去该页面</h2>
        <h6>如有不满请联系你领导</h6>
        <ul class="list-unstyled">
          <li>或者你可以去:</li>
          <li class="link-type">
            <a @click="gotoDashboard">回首页</a>
          </li>
          <li class="link-type">
            <a @click="gotoLogin">重新登录</a>
          </li>
        </ul>
      </dt>
      <dd>
        <img src="./img/401.gif" class="some-gif" alt="" title="" />
      </dd>
    </dl>
  </layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Layout from '../../../layout/Layout.vue';

@Component({
  name: 'Page401',
  components: { Layout }
})
export default class extends Vue {
  back() {
    if (this.$route.query.noGoBack) {
      this.$router.push({ path: '/' });
    } else {
      this.$router.go(-1);
    }
  }

  gotoDashboard() {
    this.$router.push({ name: 'dashboard' });
  }

  gotoLogin() {
    this.$router.push({ name: 'login' });
  }
}
</script>

<style lang="scss" scoped>
.http401-container {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 20px;

  > dt,
  > dd {
    max-width: 100%;
    width: 300px;
  }

  h2 {
    font-size: 26px;
    margin: 20px 0;
  }

  .back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }

  .some-gif {
    margin: 0 auto;
    display: block;
  }

  .some-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }

  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }

  .link-type {
    cursor: pointer;
  }

  .list-unstyled {
    font-size: 14px;

    li {
      padding-bottom: 5px;
    }

    a {
      color: #008489;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 700px) {
  .http401-container {
    flex-direction: column;
  }
}
</style>
