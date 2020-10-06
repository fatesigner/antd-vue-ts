<template>
  <section class="menus">
    <div class="content">
      <menus-auth-setting
        :add="menus.add"
        :get-roles="menus.getRoles"
        :read="menus.read"
        :excluded-roles="menus.excludedRoles"
      />
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

import MenusAuthSetting from './MenusAuthSetting.vue';

@Component({
  name: 'MenusAuth',
  components: {
    MenusAuthSetting
  }
})
export default class extends Vue {
  menus = {
    // 排除管理员角色
    excludedRoles: [AuthService.superRole],
    getRoles() {
      return ApiService.getRoles().then((res: any) => {
        return res.rows;
      });
    },
    read(role: any) {
      return ApiService.getMenus({
        role: role || AuthService.superRole
      });
    },
    add(role: any, menus: any) {
      return ApiService.updateMenu({
        role: role || AuthService.superRole,
        menus: JSON.stringify(menus)
      });
    }
  };
}
</script>
