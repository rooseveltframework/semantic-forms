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
      // no pixel is allowed to differ: the container pins the rendering, so the same markup produces the same pixels every time and any difference is a real change worth looking at. an allowance here hides exactly what these tests exist to catch, and a generous one let a whole section shift while still comparing clean against a baseline of the old layout
      //
      // threshold matters as much as the count, because it decides whether a pixel is counted as differing in the first place, and the default of 0.2 is wide enough to swallow a recolour whole: a fill moving by ten values out of 255 registered as zero differing pixels, so a tab drawn in entirely the wrong colour still compared clean against its baseline. this is set just above the rendering's own noise, which is a handful of pixels a shade or two either way, and well under the smallest change worth catching
      threshold: 0.02,
      maxDiffPixels: 0,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css'
    }
  }
}
