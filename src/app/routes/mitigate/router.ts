/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../model';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/mitigate',
  name: 'mitigate',
  component: () => import('./Mitigate.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner],
    label: I18nkeys.route.mitigate,
    keepAlive: true
  }
};

export default Router;
