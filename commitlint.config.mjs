const PARTICLES = [
  '으로',
  '에서',
  '까지',
  '을',
  '를',
  '이',
  '가',
  '은',
  '는',
  '와',
  '과',
  '로',
  '에',
  '의',
  '도',
  '만',
];
const PARTICLE_AFTER_SPACE = new RegExp(
  `[A-Za-z0-9\`)\\]] (${PARTICLES.join('|')})(\\s|$|[,.])`
);

const SENTENCE_ENDING = /(다|요|죠|네)$/;

const config = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'korean-particle-no-space': ({ header }) => [
          !PARTICLE_AFTER_SPACE.test(header ?? ''),
          '영문과 코드 뒤 조사는 붙여 쓴다. 예: `pnpm lint` 를 -> `pnpm lint`를',
        ],
        'subject-noun-ending': ({ subject }) => [
          !SENTENCE_ENDING.test(subject ?? ''),
          '제목은 명사형으로 끝낸다. "추가한다"가 아니라 "추가"',
        ],
      },
    },
  ],
  rules: {
    'subject-case': [0],
    'scope-empty': [2, 'always'],
    'header-max-length': [2, 'always', 50],
    'body-max-line-length': [1, 'always', 72],
    'korean-particle-no-space': [2, 'always'],
    'subject-noun-ending': [2, 'always'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'docs',
        'test',
        'chore',
        'perf',
        'style',
        'ci',
        'build',
        'revert',
      ],
    ],
  },
};

export default config;
