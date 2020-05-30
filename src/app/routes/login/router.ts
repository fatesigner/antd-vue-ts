/**
 * router
 */

import { IAppRouteConfig } from '../interfaces';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/login',
  name: 'login',
  component: () => import('./Login.vue'),
  meta: {
    label: I18nkeys.route.login
  }
};

export default Router;
