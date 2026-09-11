const rooseveltConfig = require('roosevelt/config')

module.exports = {
  makeBuildArtifacts: 'staticsOnly',
  http: {
    port: 6588
  },
  viewEngine: [
    'html:teddy'
  ],
  css: {
    sourcePath: 'css',
    compiler: {
      enable: true,
      module: 'sass',
      options: {}
    },
    output: 'css',
    versionFile: null
  },
  js: {
    sourcePath: 'js',
    bundler: {
      enable: true,
      module: 'webpack'
    },
    bundles: [
      {
        config: {
          entry: rooseveltConfig.ref(param => `${param.js.sourcePath}/semantic-forms-main.js`),
          output: {
            path: rooseveltConfig.ref(param => `${param.publicFolder}/js`),
            filename: 'semantic-forms-main.js'
          },
          resolve: {
            alias: {
              fs: false,
              path: false
            },
            modules: [
              rooseveltConfig.ref(param => `${param.js.sourcePath}`),
              rooseveltConfig.ref(param => `${param.buildFolder}/js`),
              rooseveltConfig.ref(param => `${param.appDir}`),
              'node_modules'
            ]
          }
        }
      }
    ]
  }
}
