<template>
  <layout-empty>
    <div class="login">
      <div class="vui-row vui-align-items-center">
        <img class="vui-mr10" src="../../../assets/img/logo.jpg" width="36" height="36" alt="" title="" />
        <h2>{{ global.title }}</h2>
      </div>
      <div class="field-warp">
        <div class="vui-mb20">
          <div class="field-content input">
            <label>
              <input v-model="form.username.value" placeholder="输入用户名" />
            </label>
            <transition-slide direction="up">
              <div class="error-message" v-if="form.username.error.visible">{{ form.username.error.message }}</div>
            </transition-slide>
          </div>
        </div>
        <div class="vui-mb20">
          <div class="field-content input">
            <label>
              <input type="password" v-model="form.password.value" placeholder="输入密码" />
            </label>
            <transition-slide direction="up">
              <div class="error-message" v-if="form.password.error.visible">{{ form.password.error.message }}</div>
            </transition-slide>
          </div>
        </div>
        <div class="vui-mb20">
          <div class="vui-row vui-no-padding">
            <div class="input vui-mr10">
              <label>
                <input type="text" v-model="form.validateCode.value" placeholder="输入验证码" />
              </label>
              <transition-slide direction="up">
                <div class="error-message" v-if="form.validateCode.error.visible">
                  {{ form.validateCode.error.message }}
                </div>
              </transition-slide>
            </div>
            <GraphicCode ref="codeCom" @graphChange="form.validateCode.grapCode = $event" />
          </div>
        </div>
        <el-button
          class="full-width"
          color="orange full-width"
          push
          size="lg"
          type="submit"
          :loading="uploading"
          @click="onSubmit"
          >登录</el-button
        >
      </div>
    </div>
  </layout-empty>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ApiService } from '../../api/api';
import { Session } from '../../session';
import { Global } from '../../../config/global';
import { AppendRoleRadios } from '../../../public/common';
import { GraphicCode } from '../../components/graphic-code';
import { TransitionSlide } from '../../components/transition';
import { ProgressBarStore } from '../../layouts/components/progress-bar';
import { LayoutEmpty } from '../../layouts';

@Component({
  name: 'LoginPage',
  components: {
    LayoutEmpty,
    GraphicCode,
    TransitionSlide
  }
})
export default class extends Vue {
  global = Global;

  uploading = false;

  form = {
    username: {
      value: '',
      getValue() {
        return this.value.trim();
      },
      verify() {
        const value = this.getValue();
        if (!value) {
          this.error.message = '请输入用户名';
          this.error.visible = true;
          return false;
        }
        this.error.visible = false;
        return true;
      },
      error: {
        message: '',
        visible: false
      }
    },
    password: {
      value: '',
      getValue() {
        return this.value;
      },
      verify() {
        const value = this.getValue();
        if (!value) {
          this.error.message = '请输入密码';
          this.error.visible = true;
          return false;
        }
        this.error.visible = false;
        return true;
      },
      error: {
        message: '',
        visible: false
      }
    },
    validateCode: {
      value: '',
      grapCode: '',
      getValue() {
        return this.value;
      },
      verify() {
        const value = this.getValue();
        if (!value) {
          this.error.message = '请输入验证码';
          this.error.visible = true;
          return false;
        } else if (value !== this.grapCode) {
          this.error.message = '验证码不正确';
          this.error.visible = true;
          return false;
        }
        this.error.visible = false;
        return true;
      },
      error: {
        message: '',
        visible: false
      }
    }
  };

  dialog = {
    visible: false,
    message: ''
  };

  // 验证表单
  verify() {
    return new Promise((resolve, reject) => {
      let valid = true;
      const formData = {};
      Object.keys(this.form).forEach((key) => {
        valid = this.form[key].verify();
        formData[key] = this.form[key].getValue();
      });

      if (valid) {
        resolve(formData);
      } else {
        reject(new Error());
      }
    });
  }

  // 提交表单
  onSubmit() {
    this.verify()
      .then((formData: any) => {
        this.uploading = true;
        console.log(ProgressBarStore);
        this.$store.dispatch(ProgressBarStore.actionKeys.present);
        ApiService.login(formData)
          .then((data: any) => {
            // 保存用户信息至 session
            Session.login({
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
      })
      .catch(() => {});
  }

  mounted() {
    if (process.env.NODE_ENV === 'development') {
      AppendRoleRadios(this.$el.querySelector('.login .field-warp'), null, (role) => {
        // 设置指定角色的测试账号
        this.form.username.value = role.testAccount.username;
        this.form.password.value = role.testAccount.password;
        this.form.validateCode.value = this.form.validateCode.grapCode;
      });
    }
  }
}
</script>

<style lang="scss">
@import '../../theme/default.theme';

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f2f3f5;

  .field-warp {
    margin: 10px auto 0;

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

    .input {
      position: relative;
      overflow: hidden;
      border-color: rgb(223, 225, 230);
      border-style: solid;
      border-width: 2px;
      border-radius: 3px;

      input {
        width: 100%;
        height: 39px;
        padding: 6px;
        border: none;
      }
    }
  }

  .error-message {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 5px;
    font-size: 12px;
    font-style: italic;
    font-weight: bold;
    color: #e64545;
  }
}

@media (min-width: 704px) {
  .login .field-warp {
    width: 400px;
    padding: 60px 40px 60px;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
  }
}

@media (max-width: 704px) {
  .login .field-warp {
    width: 320px;
    padding: 0 8px;
  }
}
</style>
