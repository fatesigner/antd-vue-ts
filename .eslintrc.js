const tslint = require('@forgleaner/eslint-config/ts');
// const vueJSlint = require('@forgleaner/eslint-config/vue-js');
const vueTSlint = require('@forgleaner/eslint-config/vue-ts');

module.exports = {
  extends: '@forgleaner/eslint-config',
  overrides: [
    tslint,
    vueTSlint
  ]
};
