/**
 * router
 */

import { Role } from '../../../global';
import { IAppRouteConfig } from '../../model';
import { I18nkeys } from '../../../i18n';

const Router: IAppRouteConfig = {
  name: 'roles',
  path: '/system-settings/roles',
  component: () => import('./Roles.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner],
    label: I18nkeys.route.roles
  }
};

export default Router;
