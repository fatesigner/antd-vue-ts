/**
 * router
 */

import { RoleEnum } from '../../../config/role';
import { IAppRouteConfig } from '../../router';

const Router: IAppRouteConfig = {
  path: '/inventory',
  name: 'inventory',
  component: () => import('./Inventory.vue'),
  meta: {
    auth: [RoleEnum.sale_commissioner, RoleEnum.sale_financial],
    label: '公司库存'
  }
};

export default Router;
