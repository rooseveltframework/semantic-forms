const { test, expect } = require('@playwright/test')

// these compare rendered screenshots against committed baselines, so they only run through playwright.visual.config.js, inside the container that config documents
test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fullDemo.html')

    // the library measures how far the font paints its letters from the middle of their line and corrects for it, then measures again once the fonts have finished loading, because the first reading was taken against whatever was rendering at the time. a shot caught between the two shows every line of text a pixel out. the enhancement registers its callback on this same promise before the page finishes loading, so waiting on it here lands after that callback has run
    await page.evaluate(() => document.fonts.ready)
  })

  // each demo section is a fieldset, which is the element these capture
  const sections = {
    basic_inputs: '#basic_inputs',
    single_field: '#single_field',
    content_sized: '#content_sized',
    col_classes: '#col_classes',
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

    // a tab group inside a fieldset: the panels are nested fieldsets there, so the strip has to be drawn in the nested colours and the selected tab still has to join cleanly to the panel below it
    nested_tabs: '#nested_tabs',

    buttons: '#buttons',
    colspan_classes: '#colspan_classes',
    p_tag_elements: '#p_tag_elements'
  }

  for (const [name, selector] of Object.entries(sections)) {
    test(`${name.replace(/_/g, ' ')} should match visually`, async ({ page }) => {
      await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`)
    })
  }

  // the tab strip only exists once the enhancement has built it, so it is found by the panel it creates
  test('tabs should match visually', async ({ page }) => {
    await expect(page.locator('.tabs').first()).toHaveScreenshot('tabs.png')
  })

  test('details should match visually when opened', async ({ page }) => {
    // the closed state is already covered by the section shots above. the third details element in this section is nested inside the second, so opening the two top level ones reveals it
    for (const index of [0, 1]) {
      await page.locator('#details details').nth(index).locator('summary').first().click()
    }

    // opening one animates its height, and the disabled animations setting does not cover the discrete height transition these use, so the shot has to wait for the section to stop moving or it catches a frame partway through
    await page.locator('#details').evaluate(section => new Promise(resolve => {
      let last = -1
      let stable = 0

      // several frames rather than one, so this cannot finish on the frames before the animation has started moving
      const settle = () => {
        const height = section.getBoundingClientRect().height
        stable = height === last ? stable + 1 : 0
        last = height
        if (stable === 5) return resolve()
        window.requestAnimationFrame(settle)
      }

      window.requestAnimationFrame(settle)
    }))

    await expect(page.locator('#details')).toHaveScreenshot('details.png')
  })
})
