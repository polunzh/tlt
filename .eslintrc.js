module.exports = {
  plugins: ['import'],
  extends: 'airbnb-base',
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
  },
  rules: {
    'no-console': 'off',
    'func-names': 'off',
    'import/no-amd': 'off',
    'global-require': 'off',
    'max-len': [2, 240, 2, { ignoreUrls: true, ignoreComments: false }],
    'no-restricted-syntax': [
      2,
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'no-underscore-dangle': ['off'],
    'consistent-return': ['off'],
    'prefer-arrow-callback': ['off'],
    camelcase: ['error'],
    'no-param-reassign': ['off'],
    'newline-per-chained-call': ['off'],
    'new-parens': 'off',
    'arrow-parens': 'off',
    'no-plusplus': 'off',
    'no-nested-ternary': 'off',
    'no-mixed-operators': 'off',
    'no-useless-escape': 'off',
    'import/extensions': 'off',
    'import/newline-after-import': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-dynamic-require': 'off',
    'import/imports-first': 'off',
    'no-unused-expressions': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
  },
  globals: {
    __DEVELOPMENT__: true,
    __DEVTOOLS__: true,
    webpackIsomorphicTools: true,
    $: true,
    jQuery: true,
    sentry: true,
    socket: true,
    logger: true,
  },
};
