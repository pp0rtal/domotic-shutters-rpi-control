module.exports = {
  "rules": {
    "arrow-body-style": 0,
    "comma-dangle": [1, "never"],
    "eqeqeq": 2,
    "func-names": 0,
    "global-require": 0,
    "indent": [2, 2, { "SwitchCase": 1 }],
    "max-len": 0,
    "max-nested-callbacks": [1, 5],
    "no-else-return": 0,
    "no-multi-spaces": 1,
    "no-param-reassign": 0,
    "no-plusplus": 0,
    "no-shadow": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": [2, "nofunc"],
    "no-var": 0,
    "quote-props": [2, "as-needed", { numbers: true }],
    "quotes": [2, "single"],
    "space-before-function-paren": [1, "never"],
    "vars-on-top": 0,
    "prefer-destructuring": 0,
    "no-restricted-properties": 0,
    "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],
    "no-mixed-operators": 0
  },
  "env": {
    "node": true,
  },
  "globals": {
    "print": true
  },
  "extends": "airbnb-base"
};
