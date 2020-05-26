/**
 * router
 */

import { IAppRouteConfig } from '../../model';
import { I18nkeys } from '../../../i18n';

const Router: IAppRouteConfig = {
  path: '*',
  name: 'unauthorized',
  component: () => import('./Unauthorized.vue'),
  meta: {
    label: I18nkeys.route.error.unauthorized
  }
};

export default Router;
