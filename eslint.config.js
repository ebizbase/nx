const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      eqeqeq: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'] },
      ],
    },
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'] },
      ],
    },
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
];
