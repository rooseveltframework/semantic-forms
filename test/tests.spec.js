const { test, expect } = require('@playwright/test')
const os = require('os')
const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')
const express = require('express')
let server

test.describe('semantic forms', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync('docs/node_modules')) {
      spawnSync('npm', ['ci'], {
        stdio: 'inherit',
        cwd: 'docs'
      })
    }

    if (!fs.existsSync('docs/public')) {
      spawnSync('npm', ['run', 'd'], {
        stdio: 'inherit',
        cwd: 'docs'
      })
    }

    spawnSync('npm', ['run', 'build'], {
      stdio: 'inherit'
    })

    spawnSync('node', ['build.js', '--development-mode'], {
      stdio: 'inherit',
      cwd: 'docs'
    })

    const app = express()
    app.use(express.static(path.resolve(__dirname, '../docs/public')))
    server = app.listen(3000)
  })

  test.afterAll(async () => {
    server.close()
  })

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(msg.text()))
  })

  test.afterEach(async ({ page }) => {
    if (process.env.NYC_PROCESS_ID) {
      // extract coverage data
      const coverage = await page.evaluate(() => window.__coverage__)
      // write coverage data to a file
      if (coverage) fs.writeFileSync(path.join(process.cwd(), '.nyc_output', `coverage-${test.info().testId}.json`), JSON.stringify(coverage))
    }
  })

  test('should progressively enhance semantic forms', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/fullDemo.html')
    const result = await page.evaluate(() => {
      return document.getElementById('name').className === 'semanticform'
    })
    expect(result).toBe(true)
  })

  test('should test clear fields work', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/fullDemo.html')
    await page.focus('#name')
    await page.fill('#name', 'Some text')
    await page.click('#name ~ button.clear')
    const result = await page.evaluate(() => {
      return document.getElementById('name').value === ''
    })
    expect(result).toBe(true)
  })

  test('should test undoing clearing a field should work', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/fullDemo.html')
    await page.focus('#name')
    await page.fill('#name', 'Some text')
    await page.click('#name ~ button.clear')
    if (os.platform() === 'darwin') {
      await page.keyboard.down('Meta')
      await page.keyboard.press('z')
      await page.keyboard.up('Meta')
    } else {
      await page.keyboard.down('Control')
      await page.keyboard.press('z')
      await page.keyboard.up('Control')
    }
    const result = await page.evaluate(() => {
      return document.getElementById('name').value === 'Some text'
    })
    expect(result).toBe(true)
  })

  test('should test undoing and redoing clearing a field works', async ({ page, browserName }) => {
    if (browserName !== 'firefox') test.skip() // TODO: this test is broken in the chromium driver for some reason
    await page.goto('http://localhost:3000/fullDemo.html')
    const nameInput = page.locator('#name')
    await nameInput.focus()
    await nameInput.fill('Some text')
    await page.click('#name ~ button.clear')

    // undo
    if (os.platform() === 'darwin') {
      await page.keyboard.down('Meta')
      await page.keyboard.press('z')
      await page.keyboard.up('Meta')
    } else {
      await page.keyboard.down('Control')
      await page.keyboard.press('z')
      await page.keyboard.up('Control')
    }

    // append some extra text to the text field using type
    await nameInput.fill('Some text appended text')

    // undo
    if (os.platform() === 'darwin') {
      await page.keyboard.down('Meta')
      await page.keyboard.press('z')
      await page.keyboard.up('Meta')
    } else {
      await page.keyboard.down('Control')
      await page.keyboard.press('z')
      await page.keyboard.up('Control')
    }

    // redo
    if (os.platform() === 'darwin') {
      await page.keyboard.down('Meta')
      await page.keyboard.down('Shift')
      await page.keyboard.press('z')
      await page.keyboard.up('Shift')
      await page.keyboard.up('Meta')
    } else {
      await page.keyboard.down('Control')
      await page.keyboard.press('y')
      await page.keyboard.up('Control')
    }

    const result = await page.evaluate(() => {
      return document.getElementById('name').value === 'Some text appended text'
    })
    expect(result).toBe(true)
  })
})
