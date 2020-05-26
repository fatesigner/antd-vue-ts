/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../model';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/predelivery',
  name: 'predelivery',
  component: () => import('./Predelivery.vue'),
  meta: {
    auth: [Role.enum.sale_commissioner, Role.enum.sale_commissioner],
    label: I18nkeys.route.predelivery
  }
};

export default Router;
