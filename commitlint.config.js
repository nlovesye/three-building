// commitlint规则  https://commitlint.js.org/#/reference-rules
module.exports = {
  // https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'update', // 更新某功能（不是 feat, 不是 fix）
        'fix', // bug
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'optimize', // 优化
        'style', // 格式（不影响代码运行的变动）
        'docs', // 文档
        'chore', // 构建过程或辅助工具的变动
        'test', // 增加测试
      ],
    ],
    'type-case': [0],
    'scope-case': [0],
    'subject-case': [0, 'never'],
    'subject-full-stop': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
};
