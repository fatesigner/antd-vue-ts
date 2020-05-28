/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../model';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/withdraw',
  name: 'withdraw',
  component: () => import('./Withdraw.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner],
    label: I18nkeys.route.withdraw,
    keepAlive: true
  }
};

export default Router;
