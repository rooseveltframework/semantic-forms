const config = require('./playwright.config.js')

// screenshots differ between operating systems and browsers because of font rendering, so a baseline is only meaningful next to the environment that produced it. these tests therefore run in the official playwright container, which pins that environment for everyone: see the test-visual scripts in package.json. the snapshot files are named per browser and platform, so a baseline taken anywhere else lands beside rather than on top of the committed one.
module.exports = {
  ...config,
  testIgnore: undefined,
  testMatch: '**/visual.spec.js',
  use: {
    ...config.use,

    // pin everything that would otherwise vary with the machine running the tests
    colorScheme: 'light',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // antialiasing still differs slightly even within one environment
      animations: 'disabled',
      caret: 'hide',
      scale: 'css'
    }
  }
}
