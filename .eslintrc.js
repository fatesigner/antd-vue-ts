const tslint = require('@fatesigner/eslint-config/ts');
const vueJSlint = require('@fatesigner/eslint-config/vue-js');
const vueTSlint = require('@fatesigner/eslint-config/vue-ts');

module.exports = {
  extends: '@fatesigner/eslint-config',
  overrides: [
    tslint,
    vueJSlint,
    vueTSlint
  ]
};
