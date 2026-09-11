const { test, expect } = require('@playwright/test')

// these compare rendered screenshots against committed baselines, so they only run through playwright.visual.config.js, inside the container that config documents
test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fullDemo.html')
  })

  // each demo section is a fieldset, which is the element these capture
  const sections = {
    inputs_section: '#inputs',
    select_section: '#selects',
    checkboxes_section: '#checkboxes',
    radios_section: '#radios',
    other_section: '#other',
    alignment_section: '#alignment_classes',
    keyboard_shortcuts_section: '#keyboard_shortcuts',
    table_with_inputs: '#tables',
    semantic_table: '#semantic_table + section',
    nested_fieldsets: '#nested_fieldsets',
    buttons: '#buttons',
    colspan_classes: '#colspan_classes',
    p_tag_elements: '#p_tag_elements'
  }

  for (const [name, selector] of Object.entries(sections)) {
    test(`${name.replace(/_/g, ' ')} should match visually`, async ({ page }) => {
      await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`)
    })
  }

  test('details should match visually when opened', async ({ page }) => {
    // the closed state is already covered by the section shots above. the third details element in this section is nested inside the second, so opening the two top level ones reveals it
    for (const index of [0, 1]) {
      await page.locator('#details details').nth(index).locator('summary').first().click()
    }
    await expect(page.locator('#details')).toHaveScreenshot('details.png')
  })
})
