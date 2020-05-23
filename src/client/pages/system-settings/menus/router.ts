/**
 * router
 */

import { IAppRouteConfig } from '../../../router';
import { RoleEnum } from '../../../../config/role';

const Router: IAppRouteConfig = {
  name: 'menus',
  path: '/system-settings/menus',
  component: () => import('./Menus.vue'),
  meta: {
    auth: [RoleEnum.admin, RoleEnum.sale_commissioner],
    label: '菜单管理'
  }
};

export default Router;
