/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../interfaces';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/retail',
  name: 'retail',
  component: () => import('./Retail.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner, Role.enum.sale_financial, Role.enum.sale_warehouse],
    label: I18nkeys.route.retail,
    keepAlive: true
  }
};

export default Router;
