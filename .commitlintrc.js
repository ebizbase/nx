
const {COMMIT_TYPES: TYPES, COMMIT_SCOPES: SCOPES}  = require('./rules.js');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', Object.keys(TYPES) ],
    'scope-enum': async () => [2,'always', Object.keys(SCOPES)],
  },
};

