/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs'],
  env: { browser: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
