module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: ['plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'warn',
  },
  parserOptions: {
    sourceType: 'module',
  },
  overrides: [
    {
      files: '*.ts',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        createDefaultProgram: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/recommended--extra',
        'plugin:prettier/recommended',
      ],
      rules: {
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'prettier/prettier': 'warn',
        '@typescript-eslint/lines-between-class-members': 'warn',
        '@typescript-eslint/no-use-before-define': 'off', // <-- We use forwardRef in Angular
        '@angular-eslint/sort-ngmodule-metadata-arrays': 'warn',
        '@angular-eslint/component-selector': [
          'warn',
          {
            type: 'element',
            prefix: 'mvi',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/directive-selector': [
          'warn',
          {
            type: 'attribute',
            prefix: 'mvi',
            style: 'camelCase',
          },
        ],
        'no-console': [
          'error',
          {
            allow: [
              'warn',
              'dir',
              'timeLog',
              'assert',
              'clear',
              'count',
              'countReset',
              'group',
              'groupEnd',
              'table',
              'dirxml',
              'error',
              'groupCollapsed',
              'Console',
              'profile',
              'profileEnd',
              'timeStamp',
              'context',
            ],
          },
        ],
      },
      overrides: [
        {
          files: '*spec.ts',
          rules: {
            'import/no-extraneous-dependencies': 'off', // <-- So we dont get warnings about dev dependencies used in spec files
            '@typescript-eslint/no-floating-promises': 'off', // <-- Heavily used in spec files
          },
        },
      ],
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
    },
    {
      files: ['*.html'],
      excludedFiles: ['*inline-template-*.component.html'],
      extends: ['plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': [
          'warn',
          {
            parser: 'angular',
          },
        ],
      },
    },
  ],
};
