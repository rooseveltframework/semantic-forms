// `npm run coverage` runs the tests under nyc, having already built the bundles with coverage instrumentation. rebuilding them in the dev server would silently discard that, so the build is skipped for that run only; every other run rebuilds so the tests never see a stale bundle
//
// live reload is turned off because nothing in the tests uses it, and its websocket can take the server down: the browser resets that connection as pages navigate, and the reload middleware leaves the reset unhandled, so the server crashes and every test after it fails with connection refused
const devServer = process.env.NYC_CONFIG ? 'node dev-server.js --skip-library-build --no-frontend-reload' : 'node dev-server.js --no-frontend-reload'

module.exports = {
  timeout: 60000,
  // the visual tests are pixel comparisons that only hold within one rendering environment, so they run separately through playwright.visual.config.js rather than as part of every run
  testIgnore: '**/visual.spec.js',
  use: {
    headless: true,
    baseURL: 'http://localhost:6588'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ],
  reporter: 'line',
  workers: 1,
  webServer: {
    command: devServer, // a plain run rather than the watching dev script, so the server is up once the build finishes
    url: 'http://localhost:6588',

    // the first run also installs the docs dependencies and builds the docs site
    timeout: 300000,
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe'
  }
}
