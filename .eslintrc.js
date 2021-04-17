module.exports = {
  overrides: [
    {
      files: [
        '**/*.js',
      ],
      extends: [
        'airbnb-base',
      ],
      rules: {
        'no-restricted-syntax': 0,
      },
    },
    {
      files: [
        '**/*.ts',
      ],
      extends: [
        'airbnb-typescript/base',
      ],
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      rules: {
        'no-restricted-syntax': 0,
      },
    },
  ],
};
