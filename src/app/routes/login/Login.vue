<template>
  <layout-empty class="login">
    <div class="top">
      <img src="../../../assets/img/logo.jpg" alt="" title="" />
      <h1>{{ title }}</h1>
    </div>
    <ValidationObserver ref="validator">
      <ul class="fields">
        <li>
          <div class="input-wrap">
            <ValidationProvider name="用户名" rules="required" v-slot="{ classes, errors }">
              <label>
                <input v-model="form.username" placeholder="输入用户名" @keyup.enter="onSubmit" />
              </label>
              <transition-slide direction="up">
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-slide>
            </ValidationProvider>
          </div>
        </li>
        <li>
          <div class="input-wrap">
            <ValidationProvider name="密码" rules="required" v-slot="{ classes, errors }">
              <label>
                <input type="password" v-model="form.password" placeholder="输入密码" @keyup.enter="onSubmit" />
              </label>
              <transition-slide direction="up">
                <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
              </transition-slide>
            </ValidationProvider>
          </div>
        </li>
        <li>
          <div class="vui-row vui-no-padding">
            <div class="input-wrap vui-mr10">
              <ValidationProvider name="验证码" rules="required" v-slot="{ classes, errors }">
                <div class="input-wrap">
                  <label>
                    <input type="text" v-model="form.validateCode" placeholder="输入验证码" @keyup.enter="onSubmit" />
                  </label>
                  <transition-slide direction="up">
                    <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
                  </transition-slide>
                </div>
              </ValidationProvider>
            </div>
            <GraphicCode ref="codeCom" @graphChange="grapCode = $event" />
          </div>
        </li>
        <el-button class="btn-submit" size="lg" type="primary" :loading="uploading" @click="onSubmit">登录</el-button>
      </ul>
    </ValidationObserver>
  </layout-empty>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { TransitionSlide } from '../../../lib/vue-common/components/transition';

import { Title } from '../../global';
import { LayoutEmpty } from '../../layout';
import { GraphicCode } from '../../shared/graphic-code';
import { ProgressBarStore } from '../../layout/components/progress-bar';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';

@Component({
  name: 'LoginPage',
  components: {
    LayoutEmpty,
    GraphicCode,
    TransitionSlide
  }
})
export default class extends Vue {
  title = Title;
  uploading = false;
  grapCode = '';

  form = {
    username: '',
    password: '',
    validateCode: ''
  };

  // 提交表单
  onSubmit() {
    (this.$refs.validator as any).validate().then((success) => {
      if (success) {
        this.uploading = true;
        this.$store.dispatch(ProgressBarStore.actionKeys.present);
        ApiService.login(this.form)
          .then((data: any) => {
            // 保存用户信息至 session
            SessionService.login({
              username: data.result.userInfo.username,
              realname: data.result.userInfo.realname,
              roles: data.result.roles,
              accessToken: data.result.token
            });
            // 跳转至 redirect 或者 首页
            const path: any = this.$route.query.redirect || '/';
            this.$router.push({ path: path });
            this.$notify({
              title: '登录成功',
              message: '登录成功',
              type: 'success'
            });
          })
          .catch((err) => {
            this.$notify({
              title: 'error',
              message: err.message,
              type: 'error'
            });
          })
          .finally(() => {
            this.uploading = false;
            this.$store.dispatch(ProgressBarStore.actionKeys.dismiss);
          });
      }
    });
  }

  mounted() {
    if (process.env.NODE_ENV === 'development') {
      CommonService.appendRoleRadios(this.$el.querySelector('.login .fields'), null, (role) => {
        // 设置指定角色的测试账号
        this.form.username = role.testAccount.username;
        this.form.password = role.testAccount.password;
        this.form.validateCode = this.grapCode;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../theme/default.theme';

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 30px;

    img {
      height: 30px;
      margin-right: 10px;
    }

    h1 {
      font-size: 26px;
    }
  }

  .fields {
    > li {
      margin-bottom: 20px;
    }

    .button2 {
      width: 100%;
      height: 39px;
      line-height: 39px;
      color: #fff;
      text-decoration: none;
      cursor: pointer;
      background: map-get($colors, primary);
      border-width: 0;
      border-radius: 3px;
      transition: background 0.1s ease-out 0s, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38) 0s;

      &[disabled] {
        color: #fff;
        background-color: #999;
      }
    }

    .input-wrap {
      position: relative;
      overflow: hidden;
      border-radius: 3px;

      input {
        width: 100%;
        height: 39px;
        padding: 6px;
        background-color: rgb(250, 251, 252);
        border: 2px solid #dfe1e6;
        transition: background-color 0.2s ease-in-out 0s, border-color 0.2s ease-in-out 0s;

        &:focus {
          background-color: #fff !important;
          border-color: map-get($colors, primary);
          outline: none;
        }

        &:hover {
          background-color: rgb(235, 236, 240);
        }
      }
    }
  }

  .invalid-message {
    position: absolute;
    right: 5px;
    bottom: 2px;
    padding: 5px;
    font-size: 12px;
    font-style: italic;
    font-weight: bold;
    color: #e64545;
    pointer-events: none;
  }

  .btn-submit {
    width: 100%;
    line-height: inherit;
    transition: background-color 0.6s ease-in-out 0s, border-color 0.6s ease-in-out 0s;
  }
}

@media (min-width: 600px) {
  .login {
    background-color: #f2f3f5;

    .fields {
      width: 400px;
      padding: 40px;
      background-color: #fff;
      border-radius: 3px;
      box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    }
  }
}

@media (max-width: 600px) {
  .login {
    background-color: #fff;

    .fields {
      width: 320px;
      padding: 0 8px;
    }
  }
}
</style>
