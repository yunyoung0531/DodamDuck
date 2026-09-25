import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-nested-ternary': 'error',
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-lines': [
        'error',
        { max: 600, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'warn',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      'react/no-danger': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'enum 대신 as const 객체와 union을 쓴다.',
        },
      ],
      // 상대 경로는 같은 폴더(./)만 허용한다. 위로 올라가면 @/ 절대 경로를 쓴다
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['..', '../**'],
              message: "'../' 상대 경로 대신 '@/' 절대 경로를 쓴다.",
            },
          ],
        },
      ],
    },
  },
  {
    // 테스트는 describe 블록이 길고 픽스처에서 상대 경로를 쓴다.
    files: ['src/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
