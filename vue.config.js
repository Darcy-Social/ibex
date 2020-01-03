const path = require('path')

module.exports = {
  publicPath: "/",
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "~@/styles/imports.scss";'
      },
    }
  }
}