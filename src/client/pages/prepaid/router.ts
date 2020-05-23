/**
 * router
 */

import { RoleEnum } from '../../../config/role';
import { IAppRouteConfig } from '../../router';
import { Localekeys } from '../../locale';

const Router: IAppRouteConfig = {
  path: '/prepaid',
  name: 'prepaid',
  component: () => import('./Prepaid.vue'),
  meta: {
    auth: [RoleEnum.admin, RoleEnum.sale_commissioner],
    label: Localekeys.route.prepaid
  }
};

export default Router;
