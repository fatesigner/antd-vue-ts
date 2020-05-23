/**
 * router
 */

import { IAppRouteConfig } from '../../router';
import { Localekeys } from '../../locale';

const Router: IAppRouteConfig = {
  path: '/',
  name: 'dashboard',
  component: () => import('./Dashboard.vue'),
  meta: {
    auth: [],
    label: Localekeys.route.dashboard
  }
};

export default Router;
