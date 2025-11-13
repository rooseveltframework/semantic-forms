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
  reporter: 'line',
  workers: 1,
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:6588',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe'
  }
}
