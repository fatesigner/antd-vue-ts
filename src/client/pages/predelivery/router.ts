/**
 * router
 */

import { RoleEnum } from '../../../config/role';
import { IAppRouteConfig } from '../../router';
import { Localekeys } from '../../locale';

const Router: IAppRouteConfig = {
  path: '/predelivery',
  name: 'predelivery',
  component: () => import('./Predelivery.vue'),
  meta: {
    auth: [RoleEnum.sale_commissioner, RoleEnum.sale_commissioner],
    label: Localekeys.route.predelivery
  }
};

export default Router;
