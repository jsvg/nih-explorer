var path = require('path');

module.exports = {
  extends: [
    'eslint:recommended',
    require.resolve('ember-cli-eslint/coding-standard/ember-application.js'),
    'plugin:ember-suave/recommended'
  ],
  'plugins': [
    'ember-suave'
  ],
  rules: {
    // possible errors
    'no-console': 'warn',
    'no-extra-parens': 'error',

    // best practices
    'block-scoped-var': 'warn',
    'complexity': ['warn', 10],
    'default-case': 'warn',
    'eqeqeq': 'warn',
    'guard-for-in': 'warn',
    'no-else-return': 'warn',
    'no-empty-function': 'warn',
    'no-floating-decimal': 'error',
    'no-implicit-coercion': 'warn',
    'no-param-reassign': 'warn',
    'no-return-assign': ['error', 'always'],
    'no-self-compare': 'error',
    'no-useless-call': 'warn',
    'no-useless-escape': 'warn',
    'vars-on-top': 'warn',
    'yoda': ['error', 'never', {'exceptRange': true}],

    // variables
    'no-shadow-restricted-names': 'error',
    'no-use-before-define': 'warn',

    // stylistic
    'block-spacing': 'error',
    'computed-property-spacing': ['error', 'never'],
    'eol-last': 'error',
    'max-len': ['warn', 100],
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',

    // ember-suave overwrites
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'max-statements-per-line': ['error', { 'max': 3 }],
    'ember-suave/require-access-in-comments': 0,
    'one-var': 0
  }
};
