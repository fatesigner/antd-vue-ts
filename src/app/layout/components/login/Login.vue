<template>
  <div class="login">
    <div class="inner">
      <div class="top">
        <img src="../../../../assets/img/logo.png" alt="" title="" />
        <h1>{{ title }}</h1>
      </div>
      <a-alert v-if="error" class="login-error ant-alert-mini" type="error" closable @close="closeError">
        <template #description>{{ error }}</template>
      </a-alert>
      <div class="fields">
        <validation-observer ref="validator">
          <a-form layout="vertical">
            <a-form-item>
              <validation-provider vid="username" rules="required" v-slot="{ classes, errors }">
                <a-input :class="classes" v-model.trim="form.username" placeholder="输入用户名" />
              </validation-provider>
            </a-form-item>
            <a-form-item>
              <validation-provider name="password" rules="required" v-slot="{ classes, errors }">
                <a-input :class="classes" type="password" v-model.trim="form.password" placeholder="输入密码" />
              </validation-provider>
            </a-form-item>
            <a-form-item>
              <li>
                <div class="vui-row vui-no-padding">
                  <div class="vui-col vui-mr10">
                    <validation-provider vid="validateCode" rules="required" v-slot="{ classes, errors }">
                      <a-input
                        :class="classes"
                        v-model.trim="form.validateCode"
                        placeholder="输入验证码"
                        @keyup.enter="$refs.submitBtnRef.trigger()"
                      />
                    </validation-provider>
                  </div>
                  <div class="graphic-code">
                    <span
                      v-if="grapCodeSrc"
                      ref="verifyCode"
                      v-html="grapCodeSrc"
                      alt="验证码"
                      title="验证码"
                      @click="loadVerifyCode"
                    />
                    <template v-else>
                      <div class="backdrop" src="../../../../assets/img/graphic-code.png" alt="" title="" />
                      <as-loading class="loading" />
                    </template>
                    <!--<GraphicCode @graphChange="grapCode = $event" />-->
                  </div>
                </div>
              </li>
            </a-form-item>
            <a-form-item>
              <as-action
                ref="submitBtnRef"
                class="btn-submit"
                size="large"
                type="primary"
                :handler="onSubmit.bind(getContext())"
                >登录</as-action
              >
            </a-form-item>
          </a-form>
        </validation-observer>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import to from 'await-to-js';
import { Alert, Button, Form, Input } from 'ant-design-vue';
import { Component, Vue } from 'vue-property-decorator';
import { TransitionSlide } from '@fatesigner/vue-lib/components/transition';
import { AsLoading } from '../../../../lib/antdv-ui/components/loading';
import { AsAction } from '../../../../lib/antdv-ui/components/button-action';
import { GraphicCode } from '../../../../lib/antdv-ui/components/graphic-code';
import { GetMenusFromRoutes } from '../../../../lib/vue-helper';

import { ApiHostCollection, ENV, RoleCollection } from '../../../global';
import { SessionService } from '../../../services/session.service';
import { CommonService } from '../../../services/common.service';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { RichRoutes } from '../../../routes/config';

Vue.use(Alert);
Vue.use(Button);
Vue.use(Form);
Vue.use(Input);

@Component({
  name: 'LoginPage',
  components: {
    GraphicCode,
    TransitionSlide,
    AsLoading,
    AsAction
  }
})
export default class extends Vue {
  getContext() {
    return this;
  }

  title = ENV.VUE_APP_TITLE;
  uploading = false;
  grapCodeSrc = '';

  form = {
    username: '',
    password: '',
    validateCode: '',
    vcode: ''
  };

  data: any = {};

  get error() {
    return this.$route.params.error;
  }

  mounted() {
    CommonService.appendRadios(
      'role',
      '角色',
      null,
      RoleCollection.arr,
      this.$el.querySelector('.login .fields'),
      null,
      (data) => {
        ApiService.setRole(data.name);
        // 设置指定角色的测试账号
        this.form.username = data.account.username;
        this.form.password = data.account.password;
        this.form.validateCode = '1234';
      }
    );
    CommonService.appendRadios(
      'apiHost',
      '环境',
      ApiService.apiHost,
      ApiHostCollection.arr,
      this.$el.querySelector('.login .fields'),
      null,
      (data) => {
        // 设置 Api 地址
        ApiService.setApiHost(data.name);
        // 更新验证码
        this.loadVerifyCode();
      }
    );
  }

  loadVerifyCode() {
    return ApiService.getValidateCode()
      .then((res: any) => {
        this.grapCodeSrc = res.data;
        this.form.vcode = res.vcode;
      })
      .catch(() => {});
  }

  // 点击登录
  async onSubmit() {
    const success: boolean = await (this.$refs.validator as any).validate();

    if (success) {
      this.uploading = true;

      const [err, data] = await to(ApiService.login(this.form));

      if (err) {
        // 请求失败，刷新验证码
        this.loadVerifyCode();
        this.$notification.error({ message: '', description: err.message });
      } else {
        this.data = data;

        await this.login();

        this.$message.success('登录成功');
      }

      this.uploading = false;
    }
  }

  // 登录并跳转，保存用户信息至 session
  async login() {
    // 获取用户角色
    const roles = this.data.roles.map((x) => x);
    // 获取用户所拥有的菜单，由于后端返回的是 JSON 字符串，这里将其转换为对象
    let menus = [];
    try {
      // 由于后端返回的是 JSON 字符串，这里将其转换为对象
      menus = JSON.parse(this.data.menus);
    } catch (e) {}
    menus = AuthService.getAuthorizedMenus(menus, roles);

    SessionService.login(
      Object.assign(this.data, {
        username: this.data.username,
        realname: this.data.realname,
        // 用户头像
        avatar: this.data.avatar || require('../../../../assets/img/avatar.jpg'),
        // accessToken 有效时间 24 天
        tokenExpirationTime: new Date().getTime() + 24 * 60 * 60 * 1000,
        accessToken: (this.data.tokenType ? this.data.tokenType + ' ' : '') + (this.data.accessToken || ''),
        roles: roles,
        menus: menus
      })
    );

    // 跳转至 redirect 或者 主页
    if (AuthService.redirectEnable && this.$route.query.redirect) {
      return this.$router.replace({ path: this.$route.query.redirect as string });
    } else {
      return this.$router.replace({ name: AuthService.homepage });
    }
  }

  // 关闭错误
  closeError() {
    this.$route.params.error = null;
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

  ::v-deep {
    .ant-form-item {
      width: 290px;
      margin-right: auto;
      margin-bottom: 20px;
      margin-left: auto;

      &:first-child {
        margin-top: 20px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .ant-input {
      height: 40px;
    }
  }
}

.top {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;

  img {
    height: 28px;
    margin-top: 2px;
    margin-right: 10px;
  }

  h1 {
    font-size: 24px;
    font-weight: 500;
  }
}

.btn-submit {
  width: 100%;
  line-height: inherit;
  transition: background-color 0.6s ease-in-out 0s, border-color 0.6s ease-in-out 0s;
}

.login-error {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #c75555;
}

.graphic-code {
  display: flex;
  width: 100px;
  height: 40px;
  align-items: center;
  justify-content: center;
  text-align: center;
}

@media (min-width: 600px) {
  .login {
    background-color: #f2f3f5;
    background-image: url(../../../../assets/img/bg.svg);
    background-repeat: no-repeat, no-repeat;
    background-position: center center, center center;
    background-size: cover, cover;

    .inner {
      min-width: 360px;
      padding: 44px;
      background-color: #fff;
      border-radius: 3px;
      box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    }
  }
}

@media (max-width: 600px) {
  .login {
    background-color: #fff;

    .inner {
      min-width: 320px;
      padding: 0 15px;
    }
  }
}
</style>
