/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../interfaces';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/authorize',
  name: 'authorize',
  component: () => import('./Authorize.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner],
    label: I18nkeys.route.authorize
  }
};

export default Router;
