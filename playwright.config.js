module.exports = {
  timeout: 60000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000'
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
  workers: 1
}
