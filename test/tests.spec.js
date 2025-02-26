const { test, expect } = require('@playwright/test')
const os = require('os')
const path = require('path')
const fs = require('fs')
const express = require('express')
let server
let counter = 0

test.describe('semantic forms', () => {
  test.beforeAll(async () => {
    const app = express()
    app.use(express.static(path.resolve(__dirname, '../')))
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
      const coverage = await page.evaluate(() => window.__coverage__)
      if (coverage) {
        counter++
        fs.writeFileSync(path.join(process.cwd(), '.nyc_output', `coverage-${counter}.json`), JSON.stringify(coverage))
      }
    }
  })

  test('should progressively enhance semantic forms', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/semanticForms.html')
    const result = await page.evaluate(() => {
      return document.getElementById('name').className === 'semanticform'
    })
    expect(result).toBe(true)
  })

  test('should test clear fields work', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/semanticForms.html')
    await page.focus('#name')
    await page.fill('#name', 'Some text')
    await page.click('#name ~ button.clear')
    const result = await page.evaluate(() => {
      return document.getElementById('name').value === ''
    })
    expect(result).toBe(true)
  })

  test('should test undoing clearing a field should work', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/semanticForms.html')
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
    await page.goto('http://localhost:3000/test/semanticForms.html')
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
