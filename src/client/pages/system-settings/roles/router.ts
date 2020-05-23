/**
 * router
 */

import { IAppRouteConfig } from '../../../router';
import { RoleEnum } from '../../../../config/role';

const Router: IAppRouteConfig = {
  name: 'roles',
  path: '/system-settings/roles',
  component: () => import('./Roles.vue'),
  meta: {
    auth: [RoleEnum.admin, RoleEnum.sale_commissioner],
    label: '角色管理'
  }
};

export default Router;
