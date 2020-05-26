/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../model';

const Router: IAppRouteConfig = {
  path: '/inventory',
  name: 'inventory',
  component: () => import('./Inventory.vue'),
  meta: {
    auth: [Role.enum.sale_commissioner, Role.enum.sale_financial],
    label: '公司库存'
  }
};

export default Router;
