/**
 * router
 */

import { Role } from '../../../global';
import { IAppRouteConfig } from '../../model';
import { I18nkeys } from '../../../i18n';

const Router: IAppRouteConfig = {
  name: 'menus',
  path: '/system-settings/menus',
  component: () => import('./Menus.vue'),
  meta: {
    auth: [Role.enum.admin],
    label: I18nkeys.route.menus
  }
};

export default Router;
