const { test, expect } = require('@playwright/test')
const os = require('os')
const path = require('path')
const fs = require('fs')

test.describe('semantic forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/fullDemo.html')

    // uncomment this to reveal client-side console messages
    // page.on('console', msg => console.log(msg.text()))
  })

  test.afterEach(async ({ page }) => {
    if (process.env.NYC_PROCESS_ID) {
      // extract coverage data
      const coverage = await page.evaluate(() => window.__coverage__)
      // write coverage data to a file
      if (coverage) fs.writeFileSync(path.join(process.cwd(), '.nyc_output', `coverage-${test.info().testId}.json`), JSON.stringify(coverage))
    }

    // await page.close()
  })

  test('should progressively enhance semantic forms', async ({ page }) => {
    for (const form of await page.locator('form').all()) {
      await expect(form).toContainClass('semanticForms')
      await expect(form).toContainClass('semanticFormsActive')
    }
  })

  test.describe('labels', () => {
    test('should apply float labels to forms', async ({ page }) => {
      // class should be applied
      await expect(page.locator('article form').nth(0).locator('dl').nth(0)).toContainClass('floatLabelForm')

      // <dt> labels should not be visible
      for (const dt of await page.locator('article form').nth(0).locator('dl').nth(0).locator('dt').all()) {
        await expect(dt).not.toBeVisible()
      }

      // a float label should be added to the <dd>
      for (const dt of await page.locator('article form').nth(0).locator('dl').nth(0).locator('dd').all()) {
        await expect(dt.locator('label.floatLabelFormAnimatedLabel')).toBeVisible()
      }

      // focusing the element should float the label above the input
      await expect(page.locator('dd label[for="name"]')).toHaveCSS('transform', 'none')
      await page.locator('[name="name"]').focus()
      // TODO: this is wildly inaccurate across tests
      // await expect(page.locator('dd label[for="name"]')).toHaveCSS('transform', 'matrix(0.7, 0, 0, 0.7, 0, -28.7812)') // playwright converts "translateY(-150%) scale(0.7)"
      await page.locator('[name="name"]').blur()
      await expect(page.locator('dd label[for="name"]')).toHaveCSS('transform', 'none')
    })

    test('should disable float labels with .no-float-label class', async ({ page }) => {
      await expect(page.locator('dd label[for="search-no-float"]')).toHaveCSS('transform', 'none')
      await page.locator('[name="search-no-float"]').focus()
      await expect(page.locator('dd label[for="search-no-float"]')).not.toHaveCSS('transform', 'matrix(0.7, 0, 0, 0.7, 0, -28.7812)')
      await expect(page.locator('dd label[for="search-no-float"]')).not.toBeVisible()
    })

    test('should apply a required symbol on required inputs', async ({ page }) => {
      await expect(page.locator('dd input[name="password"]')).toHaveAttribute('required')
      await expect(page.locator('dd label[for="password"]').locator('span.required')).toBeVisible()
      await expect(page.locator('dd label[for="password"]').locator('span.required')).toHaveText('*')
    })

    test('should not apply a required symbol on required inputs when [data-no-asterisk] is present', async ({ page }) => {
      await expect(page.locator('dd input[name="required-field-no-asterisk"]')).toHaveAttribute('required')
      await expect(page.locator('dd label[for="required-field-no-asterisk"]').locator('span.required')).not.toBeVisible()
      await expect(page.locator('dd label[for="required-field-no-asterisk"]')).not.toHaveText('*')
    })

    test('should allow a custom title on required symbols', async ({ page }) => {
      await expect(page.locator('label[for="required-field-custom-title"] span.required')).toHaveAttribute('title', 'This is a custom title.')
    })

    test('should apply a help icon when [data-show-help-icon] is present', async ({ page }) => {
      await expect(page.locator('dd label[for="label-help-icon"]').locator('span.help')).toBeVisible()
    })
  })

  test.describe('inputs', () => {
    test('should stylize invalid fields', async ({ page }) => {
      await expect(page.locator('#invalid-field')).toContainClass('invalid')
      await expect(page.locator('#invalid-field')).toHaveCSS('border', '1px solid rgb(255, 0, 0)')
    })

    test('should add range values to range inputs with the .displayValue class', async ({ page }) => {
      await expect(page.locator('label[for="rangeValue"]').locator('output')).toBeVisible()
      await expect(page.locator('label[for="rangeValue"]').locator('output')).toHaveText('50')
    })

    test('should show an icon on search inputs', async ({ page }) => {
      const searchIcon = await page.evaluate(() => window.getComputedStyle(document.querySelector('.semanticForms')).getPropertyValue('--semanticFormsSearchIcon'))
      await expect(page.locator('#search-field')).toHaveCSS('background-image', searchIcon)
    })

    test('should test clear fields work', async ({ page }) => {
      // fill
      await page.focus('#name')
      await page.fill('#name', 'Some text')
      await expect(page.locator('[name="name"]')).toHaveValue('Some text')

      // clear
      await page.click('#name ~ button.clear')
      await expect(page.locator('[name="name"]')).toHaveValue('')
    })

    test('should test undoing clearing a field should work', async ({ page }) => {
      // fill
      await page.focus('#name')
      await page.fill('#name', 'Some text')
      await expect(page.locator('[name="name"]')).toHaveValue('Some text')

      // clear
      await page.click('#name ~ button.clear')
      await expect(page.locator('[name="name"]')).toHaveValue('')

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
      await expect(page.locator('[name="name"]')).toHaveValue('Some text')
    })

    // TODO: figure out why this is now broken
    test('should test undoing and redoing clearing a field works', async ({ page, browserName }) => {
      if (browserName !== 'firefox') test.skip() // TODO: this test is broken in the chromium driver for some reason

      await page.locator('#name').focus()
      await page.locator('#name').fill('Some text')
      await expect(page.locator('#name')).toHaveValue('Some text')

      // clear
      await page.click('#name ~ button.clear')
      await expect(page.locator('#name')).toHaveValue('')

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
      await expect(page.locator('#name')).toHaveValue('Some text')

      // append some extra text to the text field using type
      await page.locator('#name').fill('Some text appended text')
      await expect(page.locator('#name')).toHaveValue('Some text appended text')

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
      await expect(page.locator('#name')).toHaveValue('Some text')

      // redo
      if (os.platform() === 'darwin') {
        await page.keyboard.press('Meta+Shift+Z')
      } else {
        await page.keyboard.press('Control+Y')
      }
      await expect(page.locator('#name')).toHaveValue('Some text appended text')
    })

    test('should display a "show password" button on password inputs', async ({ page }) => {
      await page.locator('#password').fill('password1')
      await expect(page.locator('#password')).toHaveAttribute('type', 'password')

      const inputContainer = page.locator('article form').nth(0).locator('div').nth(3)
      await expect(inputContainer.locator('button.show')).toBeVisible()
      await expect(inputContainer.locator('button.show')).toHaveAttribute('title', 'Show password')

      // show password
      await inputContainer.locator('button.show').click()
      await expect(page.locator('#password')).toHaveAttribute('type', 'text')
      await expect(page.locator('#password')).toHaveValue('password1')
      await expect(inputContainer.locator('button.show')).toBeVisible()
      await expect(inputContainer.locator('button.show')).toHaveAttribute('title', 'Hide password')

      // hide again
      await inputContainer.locator('button.show').click()
      await expect(page.locator('#password')).toHaveAttribute('type', 'password')
      await expect(page.locator('#password')).toHaveValue('password1')
      await expect(inputContainer.locator('button.show')).toBeVisible()
      await expect(inputContainer.locator('button.show')).toHaveAttribute('title', 'Show password')
    })

    test('should not display a "show password" button when [data-no-reveal] is present', async ({ page }) => {
      await expect(page.locator('article form').nth(0).locator('div').nth(4).locator('input')).toHaveAttribute('type', 'password')
      await expect(page.locator('article form').nth(0).locator('div').nth(4).locator('input')).toHaveAttribute('data-no-reveal')
      await expect(page.locator('article form').nth(0).locator('div').nth(4).locator('button.show')).not.toBeVisible()
    })

    test('should allow buttons to be placed next to inputs and selects', async ({ page }) => {
      let container = page.locator('article form').nth(0).locator('div').nth(33)
      await expect(container.locator('input[type="text"]')).toBeVisible()
      await expect(container.locator('input[type="submit"]')).toBeVisible()
      await expect(container.locator('dd')).toHaveCSS('display', 'grid')
      // TODO: find a way to test for grid-template-columns: 2fr 1fr; (toHaveCSS returns absolute values)

      container = page.locator('article form').nth(0).locator('div').nth(39)
      await expect(container.locator('select')).toBeVisible()
      await expect(container.locator('button')).toBeVisible()
      await expect(container.locator('dd')).toHaveCSS('display', 'grid')
    })

    test('should properly stylize checkbox and radio groups', async ({ page }) => {
      // checkboxes
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('display', 'flex')
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('flex-direction', 'column')
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('list-style-type', 'none')

      let container = page.locator('#checkboxes + dl div').nth(0)
      await expect(container.locator('dt label')).toBeVisible()

      // radios
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('display', 'flex')
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('flex-direction', 'column')
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('list-style-type', 'none')

      container = page.locator('#radios + dl div').nth(0)
      await expect(container.locator('dt label')).toBeVisible()
    })

    test('should properly stylize single checkboxes and radios', async ({ page }) => {
      await expect(page.locator('.singleCheckbox').nth(0)).toHaveCSS('display', 'grid')
      await expect(page.locator('.singleRadio').nth(0)).toHaveCSS('display', 'grid')
    })

    test('should limit textarea rows using the [data-max-rows] attribute', async ({ page }) => {
      await expect(page.locator('#textarea-max-rows')).toHaveAttribute('rows', '3')

      // add more text to max-rows textarea
      await page.locator('#textarea-max-rows').fill('1\n2\n3\n4\n5\n6\n7')
      await expect(page.locator('#textarea-max-rows')).toHaveAttribute('rows', '3')
    })

    test('should enhance inputs with the [data-max-content] attribute', async ({ page, browserName }) => {
      // TODO: remove this once firefox supports field sizing https://caniuse.com/wf-field-sizing
      if (browserName === 'firefox') test.skip()

      await expect(page.locator('#max-content-input')).toHaveCSS('field-sizing', 'content')
      await expect(page.locator('#max-content-input')).toHaveCSS('max-width', 'max-content')

      // capture initial width to be compared with after typing
      const initialWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-input')).width))

      await page.locator('#max-content-input').fill('This is some text that is longer than the previous text.')
      const longerWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-input')).width))

      expect(initialWidth).toBeLessThan(longerWidth)
    })

    test('should enhance selects with the [data-max-content] attribute', async ({ page, browserName }) => {
      // TODO: remove this once firefox supports field sizing https://caniuse.com/wf-field-sizing
      if (browserName === 'firefox') test.skip()

      await expect(page.locator('#max-content-select')).toHaveCSS('field-sizing', 'content')
      await expect(page.locator('#max-content-select')).toHaveCSS('max-width', 'max-content')

      // capture initial width before switching to a longer text option
      const initialWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-select')).width))

      await page.locator('#max-content-select').selectOption({ index: 1 })
      const longerWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-select')).width))

      expect(initialWidth).toBeLessThan(longerWidth)
    })

    test('should enhance textareas with the [data-auto-grow] attribute', async ({ page, browserName }) => {
      // TODO: remove this once firefox supports field sizing https://caniuse.com/wf-field-sizing
      if (browserName === 'firefox') test.skip()

      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('field-sizing', 'content')

      // begins with 1 line
      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('height', '38px')

      // replace with 2 lines of text
      await page.locator('#auto-grow-textarea').fill('1\n2')
      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('height', '62px')

      // go back to 1 line of text
      await page.locator('#auto-grow-textarea').fill('1')
      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('height', '38px')

      // replace with 3 lines of text
      await page.locator('#auto-grow-textarea').fill('1\n2\n3')
      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('height', '86px')

      // pressing Shift+Enter should add a new line
      await page.locator('#auto-grow-textarea').press('Shift+Enter')
      await expect(page.locator('#auto-grow-textarea')).toHaveCSS('height', '110px')
      await page.locator('#auto-grow-textarea').press('Enter')

      // some required values should be invalid since a submit was attempted
      await expect(page.locator('#password')).toHaveCSS('border', '1px solid rgb(255, 0, 0)')
    })

    test('should enhance inputs with the [data-auto-grow] attribute', async ({ page, browserName }) => {
      // TODO: remove this once firefox supports field sizing https://caniuse.com/wf-field-sizing
      if (browserName === 'firefox') test.skip()

      await expect(page.locator('#auto-grow-input')).toHaveCSS('field-sizing', 'content')

      // begins with one row
      await expect(page.locator('#auto-grow-input')).toHaveCSS('height', '38px')

      // replace with 2 lines of text
      await page.locator('#auto-grow-input').fill('1\n2')
      await expect(page.locator('#auto-grow-input')).toHaveCSS('height', '62px')

      // go back to 1 line of text
      await page.locator('#auto-grow-input').fill('1')
      await expect(page.locator('#auto-grow-input')).toHaveCSS('height', '38px')

      // replace with 3 lines of text
      await page.locator('#auto-grow-input').fill('1\n2\n3')
      await expect(page.locator('#auto-grow-input')).toHaveCSS('height', '86px')

      // pressing Shift+Enter should add a new line
      await page.locator('#auto-grow-input').press('Shift+Enter')
      await expect(page.locator('#auto-grow-input')).toHaveCSS('height', '110px')
      await page.locator('#auto-grow-input').press('Enter')

      // some required values should be invalid since a submit was attempted
      await expect(page.locator('#password')).toHaveCSS('border', '1px solid rgb(255, 0, 0)')
    })

    test('should enhance inputs with .align- classes', async ({ page }) => {
      // inputs
      await expect(page.locator('.align-start').nth(0)).toHaveCSS('justify-self', 'start')
      await expect(page.locator('.align-center').nth(0)).toHaveCSS('justify-self', 'center')
      await expect(page.locator('.align-end').nth(0)).toHaveCSS('justify-self', 'end')

      // buttons
      await expect(page.locator('.align-start').nth(1)).toHaveCSS('justify-self', 'start')
      await expect(page.locator('.align-center').nth(1)).toHaveCSS('justify-self', 'center')
      await expect(page.locator('.align-end').nth(1)).toHaveCSS('justify-self', 'end')
    })

    test('should allow custom keyboard shortcuts that focus inputs when pressed', async ({ page }) => {
      const container = page.locator('#keyboard_shortcuts + dl')

      // metactrl+P
      await expect(container.locator('div').nth(0).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(0).locator('dd .focus-key kbd')).toHaveText(/(⌘|◆|Ctrl) P/)
      await page.keyboard.press('ControlOrMeta+P')
      await expect(page.locator('#custom-focus-input')).toBeFocused()

      // ctrl+P
      await expect(container.locator('div').nth(1).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(1).locator('dd .focus-key kbd')).toHaveText(/(⌃|Ctrl) P/)
      await page.keyboard.press('Control+P')
      await expect(page.locator('#custom-focus-ctrl-input')).toBeFocused()

      // alt+P
      await expect(container.locator('div').nth(2).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(2).locator('dd .focus-key kbd')).toHaveText(/(⌥|⎇) P/)
      await page.keyboard.press('Alt+P')
      await expect(page.locator('#custom-focus-alt-input')).toBeFocused()

      // meta+Y
      await expect(container.locator('div').nth(3).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(3).locator('dd .focus-key kbd')).toHaveText(/(⌘|◆|⊞) Y/)
      await page.keyboard.press('Meta+Y')
      await expect(page.locator('#custom-focus-meta-input')).toBeFocused()

      // metactrl+L
      await expect(container.locator('div').nth(4).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(4).locator('dd .focus-key kbd')).toHaveText(/(⌘|◆|Ctrl) L/)
      await page.keyboard.press('ControlOrMeta+L')
      await expect(page.locator('#custom-focus-number')).toBeFocused()

      // metactrl+!
      await expect(container.locator('div').nth(5).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(5).locator('dd .focus-key kbd')).toHaveText(/(⌘|◆|Ctrl) !/)
      await page.keyboard.press('ControlOrMeta+!')
      await expect(page.locator('#custom-focus-textarea')).toBeFocused()

      // alt+$ (this input already has a title and the shortcut is appended)
      await expect(container.locator('div').nth(6).locator('dd .focus-key')).not.toBeVisible()
      await expect(page.locator('#custom-focus-color')).toHaveAttribute('title', /This input has a keyboard shortcut! \((⌥|⎇) \+ \$\)/)
      await page.keyboard.press('Alt+$')
      await expect(page.locator('#custom-focus-color')).toBeFocused()

      // metactrl+U
      await expect(container.locator('div').nth(7).locator('dd .focus-key')).not.toBeVisible()
      await expect(page.locator('#custom-focus-range')).toHaveAttribute('title', /Focus with (⌘|Ctrl) \+ U/)
      await page.keyboard.press('ControlOrMeta+U')
      await expect(page.locator('#custom-focus-range')).toBeFocused()

      // metactrl+K
      await expect(container.locator('div').nth(8).locator('dd .focus-key')).not.toBeVisible()
      await expect(page.locator('#custom-focus-select')).toHaveAttribute('title', /Focus with (⌘|Ctrl) \+ K/)
      await page.keyboard.press('ControlOrMeta+K')
      await expect(page.locator('#custom-focus-select')).toBeFocused()
    })
  })

  // TODO: the visual tests require more consideration for running within the CI
  test.describe.skip('visual tests', () => {
    test('input section should match visually', async ({ page }) => {
      await expect(page.locator('#inputs + dl')).toHaveScreenshot('inputs_section.png')
    })

    test('select section should match visually', async ({ page }) => {
      await expect(page.locator('#selects + dl')).toHaveScreenshot('select_section.png')
    })

    test('checkboxes section should match visually', async ({ page }) => {
      await expect(page.locator('#checkboxes + section')).toHaveScreenshot('checkboxes_section.png')
    })

    test('radios section should match visually', async ({ page }) => {
      await expect(page.locator('#radios + section')).toHaveScreenshot('radios_section.png')
    })

    test('other section should match visually', async ({ page }) => {
      await expect(page.locator('#other + dl')).toHaveScreenshot('other_section.png')
    })

    test('alignment section should match visually', async ({ page }) => {
      await expect(page.locator('#alignment_classes + section')).toHaveScreenshot('alignment_section.png')
    })

    test('keyboard shortcuts section should match visually', async ({ page }) => {
      await expect(page.locator('#keyboard_shortcuts + dl')).toHaveScreenshot('keyboard_shortcuts_section.png')
    })

    test('tables should match visually', async ({ page }) => {
      await expect(page.locator('#tables + section')).toHaveScreenshot('table_with_inputs.png')

      await expect(page.locator('#semantic_table + section')).toHaveScreenshot('semantic_table.png')
    })

    test('nested fieldsets should match visually', async ({ page }) => {
      await expect(page.locator('#nested_fieldsets + fieldset')).toHaveScreenshot('nested_fieldsets.png')
    })

    test('details should match visually', async ({ page }) => {
      const details = page.locator('#details + details + details')
      await details.locator('summary').click()
      await expect(details).toHaveScreenshot('details.png')
    })

    test('buttons should match visually', async ({ page }) => {
      await expect(page.locator('#buttons + section')).toHaveScreenshot('buttons.png')
    })

    test('colspan- classes should match visually', async ({ page }) => {
      await expect(page.locator('#colspan_classes + section')).toHaveScreenshot('colspan_classes.png')
    })

    test('p tag elements should match visually', async ({ page }) => {
      await expect(page.locator('#p_tag_elements + section')).toHaveScreenshot('p_tag_elements.png')
    })
  })
})
