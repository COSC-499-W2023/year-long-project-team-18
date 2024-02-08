module.exports = {
    presets: [['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
    ],
    plugins: [
        // Other plugins
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        // If you're using class properties, you might also need '@babel/plugin-proposal-class-properties'
        // ['@babel/plugin-proposal-class-properties', { loose: true }],
      ],
};