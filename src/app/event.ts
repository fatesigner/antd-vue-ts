/**
 * event
 */

import { CreateBehaviorEventBus, CreateEventBus } from '../lib/vue-helper/event';

import { RoleCollection } from './global';
import { IUser } from './interfaces/user';

export const Events = {
  login: CreateBehaviorEventBus<IUser<typeof RoleCollection.keys>>(null),
  logout: CreateEventBus<{
    expired: boolean;
    message: string;
  }>(),
  roleChanged: CreateBehaviorEventBus<keyof typeof RoleCollection.enum>(null)
};
