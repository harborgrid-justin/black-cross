module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'class-methods-use-this': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
  },
};
