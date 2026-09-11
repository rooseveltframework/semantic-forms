import { fileURLToPath } from 'url'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// `npm run coverage` builds the library with istanbul counters so that the browser exposes window.__coverage__ for the tests to harvest
const coverageInstrumentation = process.argv.includes('coverage')
  ? {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: '@jsdevtools/coverage-istanbul-loader'
        }
      ]
    }
  : undefined

export default [
  // esm
  {
    name: 'main',
    entry: './semanticForms.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'semantic-forms.mjs',
      library: {
        type: 'module'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    experiments: {
      outputModule: true
    },
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: false,
              unused: true
            },
            mangle: false,
            format: {
              comments: 'all'
            }
          }
        })
      ]
    }
  },

  // commonjs
  {
    name: 'main',
    entry: './semanticForms.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'semantic-forms.cjs',
      library: 'semanticForms',
      libraryTarget: 'umd',
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: false,
              unused: true
            },
            mangle: false,
            format: {
              comments: 'all'
            }
          }
        })
      ]
    },
    // the docs site the tests run against bundles dist/semantic-forms.cjs, so this is the build that has to carry the counters for a coverage run to measure anything
    module: coverageInstrumentation
  },

  // standalone (directly includable in a <script> tag)
  {
    name: 'main',
    entry: './semanticForms.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'semantic-forms.js',
      library: 'semanticForms',
      libraryTarget: 'umd',
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: false,
              unused: true
            },
            mangle: false,
            format: {
              comments: 'all'
            }
          }
        })
      ]
    }
  },

  // esm minified
  {
    name: 'main',
    entry: './semanticForms.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'semantic-forms.min.mjs',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    },
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: true,
              unused: true
            },
            mangle: true,
            format: {
              comments: false
            }
          }
        })
      ]
    }
  },

  // standalone (directly includable in a <script> tag) minified
  {
    name: 'main',
    entry: './semanticForms.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'semantic-forms.min.js',
      library: 'semanticForms',
      libraryTarget: 'umd',
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: true,
              unused: true
            },
            mangle: true,
            format: {
              comments: false
            }
          }
        })
      ]
    }
  }
]
