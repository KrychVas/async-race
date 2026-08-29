import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default tseslint.config(
  
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  eslintPluginUnicorn.configs['flat/recommended'],

  {
    languageOptions: {
      globals: {
        ...globals.browser, 
        ...globals.builtin, 
      },
    },
    rules: {
      
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': ['error', { ignore: [0, 1, -1] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Приклад перевизначення конкретного правила з Unicorn (за потреби):
      // 'unicorn/prevent-abbreviations': 'off',
    },
  }
);