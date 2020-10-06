<template>
  <div class="update-pwd">
    <validation-observer ref="validator">
      <a-form layout="vertical">
        <a-form-item label="用户名" v-show="!username">
          <validation-provider class="vui-rel" tag="div" vid="username" rules="required" v-slot="{ classes, errors }">
            <a-input :class="classes" v-model.trim="form.username" placeholder="输入用户名" />
            <transition-slide direction="up">
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </transition-slide>
          </validation-provider>
        </a-form-item>
        <a-form-item label="旧密码">
          <validation-provider
            class="vui-rel"
            tag="div"
            vid="oldpassword"
            rules="required"
            v-slot="{ classes, errors }"
          >
            <a-input :class="classes" type="password" v-model.trim="form.oldpassword" placeholder="输入旧密码" />
            <transition-slide direction="up">
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </transition-slide>
          </validation-provider>
        </a-form-item>
        <a-form-item label="新密码">
          <validation-provider class="vui-rel" tag="div" name="password" rules="required" v-slot="{ classes, errors }">
            <a-input :class="classes" type="password" v-model.trim="form.password" placeholder="输入新密码" />
            <transition-slide direction="up">
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </transition-slide>
          </validation-provider>
        </a-form-item>
        <a-form-item label="确认新密码">
          <validation-provider
            class="vui-rel"
            tag="div"
            name="新密码"
            rules="required|confirmed:@password"
            v-slot="{ classes, errors }"
          >
            <a-input
              :class="classes"
              type="password"
              v-model.trim="form.confirmpassword"
              @keyup.enter="$refs.submitBtnRef.trigger()"
              placeholder="确认新密码"
            />
            <transition-slide direction="up">
              <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
            </transition-slide>
          </validation-provider>
        </a-form-item>
        <a-form-item label="验证码">
          <div class="vui-row vui-no-padding">
            <div class="vui-col vui-mr10">
              <validation-provider
                class="vui-rel"
                tag="div"
                vid="captcha"
                rules="required"
                v-slot="{ classes, errors }"
              >
                <a-input
                  :class="classes"
                  v-model.trim="form.captcha"
                  placeholder="输入验证码"
                  @keyup.enter="$refs.submitBtnRef.trigger()"
                />
                <transition-slide direction="up">
                  <div class="invalid-message" v-if="errors.length">{{ errors[0] }}</div>
                </transition-slide>
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
        </a-form-item>
        <a-form-item>
          <as-action
            ref="submitBtnRef"
            class="btn-submit secondary"
            size="large"
            type="primary"
            :handler="onSubmit.bind(getContext())"
            >提交</as-action
          >
        </a-form-item>
      </a-form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { Form, Input } from 'ant-design-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TransitionSlide } from '@fatesigner/vue-lib/components/transition';
import { AsAction } from '../../../lib/antdv-ui/components/button-action';
import { AsLoading } from '../../../lib/antdv-ui/components/loading';

import { ApiService } from '../../services/api.service';

Vue.use(Form);
Vue.use(Input);

@Component({
  name: 'UpdatePwd',
  components: {
    TransitionSlide,
    AsLoading,
    AsAction
  }
})
export default class extends Vue {
  @Prop({ default: null }) username: string;
  @Prop({ default: null }) token: string;

  getContext() {
    return this;
  }

  grapCode = '';
  grapCodeSrc = '';

  form = {
    username: '',
    oldpassword: '',
    password: '',
    confirmpassword: '',
    captcha: '',
    vcode: ''
  };

  mounted() {
    this.form.username = this.username;
    this.loadVerifyCode();
  }

  loadVerifyCode() {
    return ApiService.getValidateCode().then((res: any) => {
      this.grapCodeSrc = res.data;
      this.form.vcode = res.vcode;
    });
  }

  // 提交表单
  onSubmit() {
    return (this.$refs.validator as any).validate().then((success) => {
      if (success) {
        return ApiService.updatePassword(this.form)
          .then(() => {
            this.$message.success('密码修改成功');
            this.$emit('done');
            this.reset();
          })
          .catch((err) => {
            // 请求失败，刷新验证码
            this.loadVerifyCode();
            throw err;
          });
      }
    });
  }

  reset() {
    this.form = {
      username: this.username,
      oldpassword: '',
      password: '',
      confirmpassword: '',
      captcha: '',
      vcode: ''
    };
    (this.$refs?.validator as any)?.reset();
  }
}
</script>

<style lang="scss" scoped>
.update-pwd {
  width: 240px;

  ::v-deep {
    .ant-input {
      height: 40px;
    }
  }
}

.invalid-message {
  position: absolute;
  right: 5px;
  bottom: 8px;
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

.graphic-code {
  width: 100px;
  height: 40px;
  text-align: center;
}
</style>
