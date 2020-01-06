const getScopedName = require('./src/utils/get-scoped-name.js')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  pluginOptions: {
    lintStyleOnBuild: true,
    stylelint: {},
  },
  css: {
    requireModuleExtension: true,
    loaderOptions: {
      css: {
        modules: {
          ...(isDev ? {
            localIdentName: '[name]__[local]_[hash:base64:5]',
          } : {
            getLocalIdent: (context, localIdentName, localName) => (
              getScopedName(localName, context.resourcePath)
            ),
          }),
        },
      },
    },
  },
}
