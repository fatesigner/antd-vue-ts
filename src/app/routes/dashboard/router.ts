/**
 * router
 */

import { I18nkeys } from '../../i18n';
import { IAppRouteConfig } from '../model';
import { Role } from '../../global';

const Router: IAppRouteConfig = {
  path: '/',
  name: 'dashboard',
  component: () => import('./Dashboard.vue'),
  meta: {
    auth: Role.keys,
    label: I18nkeys.route.dashboard
  }
};

export default Router;
