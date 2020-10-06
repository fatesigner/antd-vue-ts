/**
 * decimal
 */

import { extend } from 'vee-validate';

extend('decimal', {
  validate: (value, args: any) => {
    const [decimals = '*', separator = '.'] = args;
    if (value === null || value === undefined || value === '') {
      return {
        valid: false
      };
    }
    if (Number(decimals) === 0) {
      return {
        valid: /^-?\d*$/.test(value)
      };
    }
    const regexPart = decimals === '*' ? '+' : `{1,${decimals}}`;
    const regex = new RegExp(`^[-+]?\\d*(\\${separator}\\d${regexPart})?([eE]{1}[-]?\\d+)?$`);

    return {
      valid: regex.test(value)
    };
  },
  message(field, args: any) {
    if (args) {
      if (args[0]) {
        const decimals = args[0];
        if (decimals) {
          return `${args._field_}必须是数字，且不超过${decimals}位小数`;
        }
      }
    }
    return `${args._field_}必须是数字`;
  }
});
