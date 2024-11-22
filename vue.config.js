// vue.config.js
module.exports = {
    chainWebpack: config => {
      config.module
        .rule('ts')
        .use('ts-loader')
        .loader('ts-loader')
        .end()
    }
  }
  