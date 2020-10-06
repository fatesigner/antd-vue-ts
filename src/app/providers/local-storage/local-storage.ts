/**
 * local-storage
 */

import { SetIdentification } from '@fatesigner/utils/local-storage';

import { ENV } from '../../global';

// 设置本地存储的 key
SetIdentification(ENV.VUE_APP_KEY);
