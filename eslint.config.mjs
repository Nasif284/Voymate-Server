import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'package-lock.json', 'scripts/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // plugins: {
    //   prettier: prettierPlugin,
    // },
    rules: {
      //   'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },
  prettierConfig,
);
