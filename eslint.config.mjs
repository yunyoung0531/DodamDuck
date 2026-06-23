import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['dodamduck_fe/**'],
  },
];

export default eslintConfig;
