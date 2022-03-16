const presets = [
  [
    '@babel/env',
    {
      corejs: '3',
      useBuiltIns: "entry"
    }
  ]
];

const plugins = ['@babel/plugin-transform-runtime']

module.exports = { presets, plugins };
