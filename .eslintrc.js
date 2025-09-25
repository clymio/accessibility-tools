const stylistic = require('@stylistic/eslint-plugin');
/**
 * The configuration we're using for styling the project comes from ESLint Stylistic.
 * https://eslint.style/rules
 * */

const customized = stylistic.configs.customize({
  indent: 2,
  quotes: 'single',
  semi: true,
  commaDangle: 'never',
  jsx: true,
  braceStyle: '1tbs'
});

module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals'],
  plugins: [
    'react',
    '@stylistic',
    '@stylistic/jsx'
  ],
  overrides: [
    {
      files: ['*.jsx', '*.js']
    }
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    ...customized.rules,
    semi: 'error',
    '@stylistic/semi': 'error',
    '@stylistic/jsx/jsx-indent': ['error', 2],
    '@stylistic/jsx/jsx-indent-props': ['error', 2],
    '@stylistic/jsx-quotes': ['error', 'prefer-single'],
    '@stylistic/max-statements-per-line': ['error', { max: 3 }],
    '@stylistic/jsx/jsx-first-prop-new-line': ['error', 'multiline'],
    '@stylistic/jsx-one-expression-per-line': 'off',
    '@stylistic/no-multi-spaces': ['error'],
    '@stylistic/object-curly-newline': ['error', { consistent: true }],
    '@stylistic/semi-spacing': ['error', { before: false, after: true }],
    '@stylistic/comma-spacing': ['error', { before: false, after: true }],
    '@stylistic/quote-props': ['error', 'as-needed'],
    'security/detect-object-injection': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'import/no-anonymous-default-export': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'off'
  }
};
