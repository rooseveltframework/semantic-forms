const { test, expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

// drags a switch horizontally by the given number of pixels, starting from its centre
const dragSwitch = async (page, locator, distance) => {
  // mouse coordinates are relative to the viewport, and the demo page is far taller than one
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  const y = box.y + box.height / 2
  const x = box.x + box.width / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + distance, y, { steps: 5 })
  await page.mouse.up()
}

// measures the gap between the right edge of an input and where its label's text starts, which is negative when the label is printed over the top of the control
const labelGap = (page, selector) => page.evaluate(target => {
  const input = document.querySelector(target)
  // an enhanced form adds its own label next to the input and hides the original one in the dt, so whichever label is actually being rendered is the one to measure
  const label = [...input.closest('div').querySelectorAll('label')]
    .find(candidate => candidate.getBoundingClientRect().width > 0)
  const text = document.createRange()
  text.selectNodeContents(label)
  return Math.round(text.getBoundingClientRect().x - input.getBoundingClientRect().right)
}, selector)

// how far the label's text sits from the middle of its field
//
// the stylesheet centers the label's box on the field and then shifts it by the ink offset, which is how far this font's letters sit from the middle of their own box. adding that offset back therefore lands on the middle of the field exactly. reading the drawn pixels instead would be measuring the platform's font smoothing as much as the position
const labelCenterOffset = (page, selector) => page.locator(selector).evaluate(input => {
  const label = input.parentNode.querySelector('label')
  const field = input.getBoundingClientRect()
  const box = label.getBoundingClientRect()
  const inkOffset = parseFloat(window.getComputedStyle(input.closest('dl')).getPropertyValue('--semanticFormsTextInkOffset')) || 0
  return (box.top + box.bottom) / 2 + inkOffset - (field.top + field.bottom) / 2
})

// focuses a field and measures how many pixels thick its focus highlight renders at the left and right edges, by reading a one pixel tall slice across the middle of the control
const focusRingEdges = async (page, selector) => {
  const field = page.locator(selector)
  await field.scrollIntoViewIfNeeded()
  await field.focus()
  const box = await field.boundingBox()
  const margin = 4
  const slice = await page.screenshot({
    clip: { x: Math.round(box.x) - margin, y: box.y + box.height / 2, width: Math.round(box.width) + margin * 2, height: 1 }
  })
  return page.evaluate(async data => {
    const image = new window.Image()
    image.src = 'data:image/png;base64,' + data
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = 1
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, image.width, 1).data
    // the focus color is #c0c0c0 in the light theme the tests run in
    const isRing = i => [0, 1, 2].every(channel => Math.abs(pixels[i * 4 + channel] - 192) < 14)

    let index = 0
    let left = 0
    while (index < image.width && !isRing(index)) index++
    while (index < image.width && isRing(index)) { left++; index++ }

    let backIndex = image.width - 1
    let right = 0
    while (backIndex >= 0 && !isRing(backIndex)) backIndex--
    while (backIndex >= 0 && isRing(backIndex)) { right++; backIndex-- }

    return { left, right }
  }, slice.toString('base64'))
}

// the colour a switch shows when it is on, which follows the operating system's accent colour where the browser knows that keyword, so it cannot be written down here as a literal
const switchOnColour = page => page.locator('#switch').evaluate(el => {
  const probe = document.createElement('span')
  probe.style.color = window.getComputedStyle(el).getPropertyValue('--semanticFormsSwitchOnColor')
  el.closest('form').append(probe)
  const colour = window.getComputedStyle(probe).color
  probe.remove()
  return colour
})

// the demo shows the javascript enhanced widgets by default; this switches it over to the lowFlow copies, which is what a visitor without javascript sees
const showLowFlowView = async page => {
  const toggle = page.locator('#low_flow_view')
  await toggle.scrollIntoViewIfNeeded()
  await toggle.check()
  await expect(page.locator('#low_flow')).toBeVisible()
}

// appends markup to the page, which the mutation observer then enhances
const addForm = (page, markup) => page.evaluate(html => document.body.insertAdjacentHTML('beforeend', html), markup)

// collects console output of the given type from the moment it is called
const watchConsole = (page, type) => {
  const messages = []
  page.on('console', message => {
    if (message.type() === type) messages.push(message.text())
  })
  return messages
}

// records the input and change events an element emits, and returns a reader for them
const trackToggleEvents = async (page, selector) => {
  await page.evaluate(target => {
    window.semanticFormsToggleEvents = []
    const element = document.querySelector(target)
    for (const name of ['input', 'change']) {
      element.addEventListener(name, () => window.semanticFormsToggleEvents.push(name))
    }
  }, selector)
  return () => page.evaluate(() => window.semanticFormsToggleEvents)
}

test.describe('semantic forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fullDemo.html')

    // uncomment this to reveal client-side console messages
    // page.on('console', msg => console.log(msg.text()))
  })

  test.afterEach(async ({ page }) => {
    // `npm run coverage` builds the library with istanbul counters, so their presence in the page is what says whether there is coverage to collect from this run
    const coverage = await page.evaluate(() => window.__coverage__)
    if (coverage) {
      const outputDir = path.join(process.cwd(), '.nyc_output')
      fs.mkdirSync(outputDir, { recursive: true })
      fs.writeFileSync(path.join(outputDir, `coverage-${test.info().testId}.json`), JSON.stringify(coverage))
    }

    await page.close()
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
      await expect(page.locator('#high_flow').locator('dl').nth(0)).toContainClass('floatLabelForm')

      // <dt> labels should not be visible
      for (const dt of await page.locator('#high_flow').locator('dl').nth(0).locator('dt').all()) {
        await expect(dt).not.toBeVisible()
      }

      // a float label should be added to the <dd>
      for (const dd of await page.locator('#high_flow').locator('dl').nth(0).locator('dd').all()) {
        await expect(dd.locator('label.floatLabelFormAnimatedLabel')).toBeVisible()
      }

      // focusing the element should float the label above the input
      await expect(page.locator('dd label[for="name"]')).toHaveCSS('transform', 'none')
      await page.locator('[name="name"]').focus()
      // the label floats with "translateY(-150%) scale(0.7)", which playwright reads back as a matrix. the translation is a percentage of the label's own height and so differs per field and per font, but the scale is always 0.7 and the shift is always upwards
      const floatMatrix = async () => ((await page.locator('dd label[for="name"]').evaluate(el => window.getComputedStyle(el).transform)).match(/-?[\d.]+/g) || []).map(Number)
      // the label transitions into place, so the settled value is the one worth asserting on
      await expect.poll(async () => (await floatMatrix())[0]).toBeCloseTo(0.7, 2)
      const [, , , scaleY, , translateY] = await floatMatrix()
      expect(scaleY).toBeCloseTo(0.7, 2)
      expect(translateY).toBeLessThan(0)
      await page.locator('[name="name"]').blur()
      await expect(page.locator('dd label[for="name"]')).toHaveCSS('transform', 'none')
    })

    // these were each positioned with a hardcoded offset that only centered the one font size it was written for, leaving them out by a fraction of a pixel that rounds to a visible one on a display that is not high density
    test('should center the resting float label on its field', async ({ page }) => {
      expect(Math.abs(await labelCenterOffset(page, '#name'))).toBeLessThan(0.1)
    })

    test('should center the clear button on its field', async ({ page }) => {
      await page.locator('#name').fill('Some text')
      const offset = await page.locator('#name').evaluate(input => {
        const button = input.parentNode.querySelector('button.clear')
        const field = input.getBoundingClientRect()
        const box = button.getBoundingClientRect()
        return (box.top + box.bottom) / 2 - (field.top + field.bottom) / 2
      })
      expect(Math.abs(offset)).toBeLessThan(0.1)
    })

    // the hint's box is deliberately off centre by the ink offset, which is how far this font's letters sit from the middle of their own box, so that the shortcut itself reads centered
    test('should center the keyboard shortcut hint on its field', async ({ page }) => {
      const offset = await page.locator('span.focus-key').first().evaluate(hint => {
        const field = hint.closest('dd').querySelector('input, select, textarea').getBoundingClientRect()
        const box = hint.getBoundingClientRect()
        const inkOffset = parseFloat(window.getComputedStyle(hint.closest('form')).getPropertyValue('--semanticFormsTextInkOffset')) || 0
        return (box.top + box.bottom) / 2 + inkOffset - (field.top + field.bottom) / 2
      })
      expect(Math.abs(offset)).toBeLessThan(0.1)
    })

    test('should keep the float label centered when the field height is overridden', async ({ page }) => {
      await page.locator('#name').evaluate(input => input.closest('form').style.setProperty('--semanticFormsInputHeight', '60px'))
      await expect(page.locator('#name')).toHaveCSS('height', '60px')
      expect(Math.abs(await labelCenterOffset(page, '#name'))).toBeLessThan(0.1)
    })

    test('should disable float labels with .no-float-label class', async ({ page }) => {
      await expect(page.locator('dd label[for="search-no-float"]')).toHaveCSS('transform', 'none')
      await page.locator('[name="search-no-float"]').focus()
      await expect(page.locator('dd label[for="search-no-float"]')).toHaveCSS('transform', 'none')
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

    test('should add range values to range inputs with the data-display-value attribute', async ({ page }) => {
      await expect(page.locator('label[for="rangeValue"]').locator('output')).toBeVisible()
      await expect(page.locator('label[for="rangeValue"]').locator('output')).toHaveText('50')
    })

    test('should still add range values for the legacy .displayValue class', async ({ page }) => {
      await addForm(page, '<form class="semanticForms"><dl><div><dt><label for="legacy-range">Legacy range</label></dt><dd><input id="legacy-range" name="legacy-range" type="range" class="displayValue"></dd></div></dl></form>')
      await expect(page.locator('label[for="legacy-range"]').locator('output')).toHaveText('50')
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
      if (process.platform === 'darwin') {
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

    test('should test undoing and redoing clearing a field works', async ({ page }) => {
      await page.locator('#name').focus()
      await page.locator('#name').fill('Some text')
      await expect(page.locator('#name')).toHaveValue('Some text')

      // clear
      await page.click('#name ~ button.clear')
      await expect(page.locator('#name')).toHaveValue('')

      // undo
      if (process.platform === 'darwin') {
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
      if (process.platform === 'darwin') {
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
      if (process.platform === 'darwin') {
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
      await expect(page.locator('#name')).toHaveValue('Some text appended text')
    })

    test('should display a "show password" button on password inputs', async ({ page }) => {
      await page.locator('#password').fill('password1')
      await expect(page.locator('#password')).toHaveAttribute('type', 'password')

      const inputContainer = page.locator('#high_flow').locator('div').nth(3)
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
      await expect(page.locator('#high_flow').locator('div').nth(4).locator('input')).toHaveAttribute('type', 'password')
      await expect(page.locator('#high_flow').locator('div').nth(4).locator('input')).toHaveAttribute('data-no-reveal')
      await expect(page.locator('#high_flow').locator('div').nth(4).locator('button.show')).not.toBeVisible()
    })

    test('should allow buttons to be placed next to inputs and selects', async ({ page }) => {
      // located by the fields themselves rather than by position, so that rearranging the demo page does not silently point these at something else
      let container = page.locator('#high_flow div:has(> dd > #input-button-2)')
      await expect(container.locator('input[type="text"]')).toBeVisible()
      await expect(container.locator('input[type="submit"]')).toBeVisible()
      await expect(container.locator('dd')).toHaveCSS('display', 'grid')
      // the columns are declared as "2fr 1fr" but resolve to pixels, so the ratio between them is what can be checked
      const columns = await container.locator('dd').evaluate(el => window.getComputedStyle(el).gridTemplateColumns.split(' ').map(parseFloat))
      expect(columns).toHaveLength(2)
      expect(columns[0] / columns[1]).toBeCloseTo(2, 1)

      container = page.locator('#high_flow div:has(> dd > #select-button)')
      await expect(container.locator('select')).toBeVisible()
      await expect(container.locator('button')).toBeVisible()
      await expect(container.locator('dd')).toHaveCSS('display', 'grid')
    })

    test('should properly stylize checkbox and radio groups', async ({ page }) => {
      // checkboxes
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('display', 'flex')
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('flex-direction', 'column')
      await expect(page.locator('.checkboxes').nth(0).locator('ul')).toHaveCSS('list-style-type', 'none')

      let container = page.locator('#checkboxes div').nth(0)
      await expect(container.locator('dt label')).toBeVisible()

      // radios
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('display', 'flex')
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('flex-direction', 'column')
      await expect(page.locator('.radios').nth(0).locator('ul')).toHaveCSS('list-style-type', 'none')

      container = page.locator('#radios div').nth(0)
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

    test('should enhance inputs with the [data-max-content] attribute', async ({ page }) => {
      await expect(page.locator('#max-content-input')).toHaveCSS('field-sizing', 'content')
      await expect(page.locator('#max-content-input')).toHaveCSS('max-width', 'max-content')

      // capture initial width to be compared with after typing
      const initialWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-input')).width))

      await page.locator('#max-content-input').fill('This is some text that is longer than the previous text.')
      const longerWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-input')).width))

      expect(initialWidth).toBeLessThan(longerWidth)
    })

    test('should enhance selects with the [data-max-content] attribute', async ({ page }) => {
      await expect(page.locator('#max-content-select')).toHaveCSS('field-sizing', 'content')
      await expect(page.locator('#max-content-select')).toHaveCSS('max-width', 'max-content')

      // capture initial width before switching to a longer text option
      const initialWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-select')).width))

      await page.locator('#max-content-select').selectOption({ index: 1 })
      const longerWidth = await page.evaluate(() => parseInt(window.getComputedStyle(document.querySelector('#max-content-select')).width))

      expect(initialWidth).toBeLessThan(longerWidth)
    })

    test('should enhance textareas with the [data-auto-grow] attribute', async ({ page }) => {
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

    test('should enhance inputs with the [data-auto-grow] attribute', async ({ page }) => {
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
      await expect(page.locator('div:has(.align-start)').nth(0)).toHaveCSS('justify-content', 'start')
      await expect(page.locator('div:has(.align-center)').nth(0)).toHaveCSS('justify-content', 'center')
      await expect(page.locator('div:has(.align-end)').nth(0)).toHaveCSS('justify-content', 'end')

      // buttons
      await expect(page.locator('div:has(.align-start)').nth(1)).toHaveCSS('justify-content', 'start')
      await expect(page.locator('div:has(.align-center)').nth(1)).toHaveCSS('justify-content', 'center')
      await expect(page.locator('div:has(.align-end)').nth(1)).toHaveCSS('justify-content', 'end')
    })

    test('should allow custom keyboard shortcuts that focus inputs when pressed', async ({ page }) => {
      const container = page.locator('#keyboard_shortcuts dl')

      // metactrl+P
      await expect(container.locator('div').nth(0).locator('dd .focus-key')).toBeVisible()
      await expect(container.locator('div').nth(0).locator('dd .focus-key kbd')).toHaveText(/(⌘|◆|Ctrl) P/)
      await page.keyboard.press('ControlOrMeta+P')
      await expect(page.locator('#custom-focus-input')).toBeFocused()

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
      await expect(page.locator('#custom-focus-color')).toHaveAttribute('title', /This input has a keyboard shortcut! \((⌥|⎇|Ctrl) \+ \$\)/)

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

    test('should show the focus highlight at full thickness on a field flush with the form edge', async ({ page }) => {
      // forms clip their horizontal overflow, so a highlight drawn outside the box loses its outer edge on a field sitting flush against that edge while looking right elsewhere
      await addForm(page, `
        <form class="semanticForms" id="flush-field-form">
          <dl>
            <div>
              <dt><label for="flush-field">Flush</label></dt>
              <dd><input type="text" id="flush-field" name="flush-field"></dd>
            </div>
          </dl>
        </form>`)

      const clearance = await page.evaluate(() => {
        const input = document.querySelector('#flush-field')
        return Math.round(input.getBoundingClientRect().left - input.closest('form').getBoundingClientRect().left)
      })
      expect(clearance).toBe(0)

      // the same thickness on both sides, and the same as a field that is not against the edge
      expect(await focusRingEdges(page, '#flush-field')).toEqual({ left: 2, right: 2 })
      expect(await focusRingEdges(page, '#textarea')).toEqual({ left: 2, right: 2 })
    })

    test('should update the range output as the value changes', async ({ page }) => {
      const output = page.locator('label[for="rangeValue"] output')
      await expect(output).toHaveText('50')

      await page.locator('#rangeValue').fill('75')
      await expect(output).toHaveText('75')
    })

    test('should toggle the file clear button as files are selected and cleared', async ({ page }) => {
      const clearButton = page.locator('#semanticFormsClearButton_file')
      await expect(clearButton).toHaveCSS('display', 'none')

      await page.locator('#file').setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('a note') })
      await expect(clearButton).toHaveCSS('display', 'flex')

      await clearButton.click()
      await expect(clearButton).toHaveCSS('display', 'none')
    })
  })

  test.describe('tabs', () => {
    const tabs = page => page.locator('#tab_group [role=tab]')
    const panels = page => page.locator('#tab_group [role=tabpanel]')

    test('should build a tab for each fieldset, named by its legend', async ({ page }) => {
      await expect(tabs(page)).toHaveText(['Account', 'Profile', 'Preferences'])
      await expect(panels(page)).toHaveCount(3)

      // the tab names the panel now, so the legend would otherwise be announced twice
      await expect(page.locator('#tab_group legend').first()).toBeHidden()
    })

    test('should show only the first panel to start with', async ({ page }) => {
      await expect(panels(page).nth(0)).toBeVisible()
      await expect(panels(page).nth(1)).toBeHidden()
      await expect(panels(page).nth(2)).toBeHidden()

      await expect(tabs(page).nth(0)).toHaveAttribute('aria-selected', 'true')
      await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'false')
    })

    test('should tie each tab to the panel it controls', async ({ page }) => {
      const panelId = await panels(page).nth(1).getAttribute('id')
      await expect(tabs(page).nth(1)).toHaveAttribute('aria-controls', panelId)

      const tabId = await tabs(page).nth(1).getAttribute('id')
      await expect(panels(page).nth(1)).toHaveAttribute('aria-labelledby', tabId)
    })

    test('should swap panels when a tab is clicked', async ({ page }) => {
      await tabs(page).nth(2).click()

      await expect(panels(page).nth(2)).toBeVisible()
      await expect(panels(page).nth(0)).toBeHidden()
      await expect(tabs(page).nth(2)).toHaveAttribute('aria-selected', 'true')
    })

    test('should keep only the selected tab in the tab order', async ({ page }) => {
      // the arrow keys reach the rest, which is how a tablist is expected to behave
      await expect(tabs(page).nth(0)).toHaveAttribute('tabindex', '0')
      await expect(tabs(page).nth(1)).toHaveAttribute('tabindex', '-1')

      await tabs(page).nth(1).click()
      await expect(tabs(page).nth(0)).toHaveAttribute('tabindex', '-1')
      await expect(tabs(page).nth(1)).toHaveAttribute('tabindex', '0')
    })

    test('should move between tabs with the arrow keys', async ({ page }) => {
      const selected = () => page.locator('#tab_group [aria-selected=true]').textContent()

      await tabs(page).nth(0).click()
      await page.keyboard.press('ArrowRight')
      expect(await selected()).toBe('Profile')

      await page.keyboard.press('End')
      expect(await selected()).toBe('Preferences')

      // and it wraps around at either end
      await page.keyboard.press('ArrowRight')
      expect(await selected()).toBe('Account')
      await page.keyboard.press('ArrowLeft')
      expect(await selected()).toBe('Preferences')

      await page.keyboard.press('Home')
      expect(await selected()).toBe('Account')
    })

    test('should number a tab whose fieldset has no legend, and keep any id it was given', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="unnamed-tab-form">
          <div class="tabs">
            <fieldset id="given-id-one">
              <dl>
                <div>
                  <dt><label for="unnamed-one">One</label></dt>
                  <dd><input type="text" id="unnamed-one" name="unnamed-one"></dd>
                </div>
              </dl>
            </fieldset>
            <fieldset id="given-id-two">
              <dl>
                <div>
                  <dt><label for="unnamed-two">Two</label></dt>
                  <dd><input type="text" id="unnamed-two" name="unnamed-two"></dd>
                </div>
              </dl>
            </fieldset>
          </div>
        </form>`)

      await expect(page.locator('#unnamed-tab-form [role=tab]')).toHaveText(['Tab 1', 'Tab 2'])

      // an id the author chose is the one the tab points at
      await expect(page.locator('#unnamed-tab-form [role=tab]').nth(1)).toHaveAttribute('aria-controls', 'given-id-two')
    })

    test('should ignore keys it does not handle', async ({ page }) => {
      await tabs(page).nth(1).click()
      await page.keyboard.press('a')
      await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')

      // and a keypress that reaches the strip while the focus is elsewhere is left alone too
      await page.evaluate(() => {
        document.activeElement.blur()
        document.querySelector('#tab_group .tabList')
          .dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      })
      await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    })

    test('should leave a group with only one fieldset alone', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="lone-tab-form">
          <div class="tabs">
            <fieldset>
              <legend>Only one</legend>
              <dl>
                <div>
                  <dt><label for="lone-tab-field">Field</label></dt>
                  <dd><input type="text" id="lone-tab-field" name="lone-tab-field"></dd>
                </div>
              </dl>
            </fieldset>
          </div>
        </form>`)

      await expect(page.locator('#lone-tab-form [role=tab]')).toHaveCount(0)
      await expect(page.locator('#lone-tab-form legend')).toBeVisible()
    })

    test('should report a tab group that holds no fieldsets', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="empty-tab-form">
          <div class="tabs"><p>Not a fieldset</p></div>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('no <fieldset> children'))).toBe(true)
    })
  })

  test.describe('tabs without javascript', () => {
    test.use({ javaScriptEnabled: false })

    test('should leave the fieldsets stacked and readable', async ({ page }) => {
      await page.goto('/fullDemo.html')

      // nothing builds the tabs, so every group of fields stays on the page with its legend
      await expect(page.locator('#low-flow-tab_group [role=tab]')).toHaveCount(0)
      await expect(page.locator('#low-flow-tab_group fieldset')).toHaveCount(3)
      for (let index = 0; index < 3; index++) {
        await expect(page.locator('#low-flow-tab_group fieldset').nth(index)).toBeVisible()
      }
      await expect(page.locator('#low-flow-tab_group legend').first()).toBeVisible()
    })
  })

  test.describe('column placement', () => {
    // reports where a field's wrapper sits in the grid, and how wide it is in whole columns
    const placement = (page, selector) => page.evaluate(target => {
      const wrapper = document.querySelector(target).closest('div')
      const style = window.getComputedStyle(wrapper)
      const tracks = window.getComputedStyle(wrapper.closest('dl')).gridTemplateColumns.split(' ').map(parseFloat)
      const gap = parseFloat(window.getComputedStyle(wrapper.closest('dl')).columnGap) || 0
      const width = wrapper.getBoundingClientRect().width
      // work out how many tracks the measured width covers
      let columns = 0
      let covered = -gap
      while (covered < width - 1 && columns < tracks.length) covered += tracks[columns++] + gap
      return { start: style.gridColumnStart, end: style.gridColumnEnd, columns }
    }, selector)

    test.beforeEach(async ({ page }) => {
      // wide enough for the three column grid the demo section asks for
      await page.setViewportSize({ width: 1150, height: 900 })
      await page.goto('/fullDemo.html')
    })

    test('should place a field in the column its col- class names', async ({ page }) => {
      expect(await placement(page, '#col-3')).toMatchObject({ start: '3', columns: 1 })
      expect(await placement(page, '#col-1')).toMatchObject({ start: '1', columns: 1 })
    })

    test('should combine col- with colspan-', async ({ page }) => {
      // the span belongs on the end so that naming a start column does not cancel it
      expect(await placement(page, '#col-2-colspan-2')).toMatchObject({ start: '2', end: 'span 2', columns: 2 })
    })

    test('should still span without a col- class', async ({ page }) => {
      expect(await placement(page, '#colspan-2')).toMatchObject({ start: 'auto', end: 'span 2', columns: 2 })
    })

    test('should stop positioning a field into a column that no longer exists', async ({ page }) => {
      // the grid drops to two columns here, so there is no third one to place anything in
      await page.setViewportSize({ width: 640, height: 900 })
      await page.goto('/fullDemo.html')

      expect(await placement(page, '#col-3')).toMatchObject({ start: 'auto' })

      // and nothing is pushed outside the form by the classes that do still apply
      const overflows = await page.evaluate(() => {
        const list = document.querySelector('#col_classes dl')
        return list.scrollWidth > Math.ceil(list.getBoundingClientRect().width)
      })
      expect(overflows).toBe(false)
    })

    test('should move a col- class from the dd onto the generated wrapper', async ({ page }) => {
      await page.evaluate(() => {
        document.body.insertAdjacentHTML('beforeend', `
          <form class="semanticForms" id="col-from-dd">
            <dl>
              <dt><label for="col-from-dd-input">Placed</label></dt>
              <dd class="col-2 colspan-2"><input id="col-from-dd-input" name="col-from-dd-input" type="text"></dd>
            </dl>
          </form>`)
      })

      const wrapper = page.locator('#col-from-dd dl > div')
      await expect(wrapper).toContainClass('col-2')
      await expect(wrapper).toContainClass('colspan-2')
      await expect(page.locator('#col-from-dd dd')).not.toContainClass('col-2')
    })
  })

  test.describe('the demo flow toggle', () => {
    test('should show the enhanced widgets and hide the unenhanced ones by default', async ({ page }) => {
      await expect(page.locator('#high_flow')).toBeVisible()
      await expect(page.locator('#low_flow')).toBeHidden()
      await expect(page.locator('#flow_toggle')).toBeVisible()
      await expect(page.locator('#low_flow_view')).not.toBeChecked()
    })

    test('should swap which set of widgets is shown when toggled', async ({ page }) => {
      await showLowFlowView(page)
      await expect(page.locator('#high_flow')).toBeHidden()

      await page.locator('#low_flow_view').uncheck()
      await expect(page.locator('#high_flow')).toBeVisible()
      await expect(page.locator('#low_flow')).toBeHidden()
    })

    test('should point the contents links at whichever set is shown', async ({ page }) => {
      const firstLink = page.locator('[data-section]').first()
      await expect(firstLink).toHaveAttribute('href', '#cat_inputs')

      await showLowFlowView(page)
      await expect(firstLink).toHaveAttribute('href', '#low-flow-cat_inputs')
    })
  })

  test.describe('the demo without javascript', () => {
    test.use({ javaScriptEnabled: false })

    test('should show only the unenhanced widgets, with a note explaining why', async ({ page }) => {
      await page.goto('/fullDemo.html')

      await expect(page.locator('#low_flow')).toBeVisible()
      await expect(page.locator('#high_flow')).toBeHidden()

      // the toggle needs javascript to do anything, so it is not offered
      await expect(page.locator('#flow_toggle')).toBeHidden()

      // the browser renders the noscript contents only when scripting is off
      await expect(page.locator('noscript p')).toBeVisible()
      await expect(page.locator('noscript p')).toContainText('JavaScript is disabled')

      // and the contents links already address the set that is on screen
      await expect(page.locator('[data-section]').first()).toHaveAttribute('href', '#low-flow-cat_inputs')
    })
  })

  test.describe('fields the user cannot edit', () => {
    test('should not give a readonly field a clear button', async ({ page }) => {
      await expect(page.locator('#readonly-field')).toHaveAttribute('readonly', '')
      await expect(page.locator('#semanticFormsClearButton_readonly-field')).toHaveCount(0)

      // the value it was given in the markup is still there
      await expect(page.locator('#readonly-field')).toHaveValue('This field is readonly')
    })

    test('should not give a readonly textarea a clear button', async ({ page }) => {
      await expect(page.locator('#semanticFormsClearButton_readonly-textarea')).toHaveCount(0)
      await expect(page.locator('#readonly-textarea')).toHaveValue('This textarea is readonly')
    })

    test('should not give a disabled field a clear button', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="disabled-form">
          <dl>
            <div>
              <dt><label for="disabled-field">Disabled</label></dt>
              <dd><input type="text" id="disabled-field" name="disabled-field" value="keep me" disabled></dd>
            </div>
          </dl>
        </form>`)

      await expect(page.locator('#disabled-field')).toContainClass('semanticform')
      await expect(page.locator('#semanticFormsClearButton_disabled-field')).toHaveCount(0)
    })

    test('should still give an editable field a clear button', async ({ page }) => {
      // the guard must not take the button away from ordinary fields
      await expect(page.locator('#semanticFormsClearButton_name')).toBeAttached()
    })

    test('should hide the clear button of a field that is made readonly later', async ({ page }) => {
      // the enhancement has already run by then, so this one is down to the stylesheet
      const button = page.locator('#semanticFormsClearButton_prefilled')
      await expect(button).toHaveCSS('display', 'flex')

      await page.evaluate(() => { document.querySelector('#prefilled').readOnly = true })
      await expect(button).toHaveCSS('display', 'none')
    })

    test('should not throw when undoing on a field that has no clear button', async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))

      // a range input never gets a clear button, and neither does a readonly field now
      for (const selector of ['#range', '#readonly-field']) {
        await page.locator(selector).scrollIntoViewIfNeeded()
        await page.locator(selector).focus()
        await page.keyboard.press('ControlOrMeta+z')
      }

      await expect.poll(() => errors).toEqual([])
    })
  })

  test.describe('input column sizing', () => {
    // applies any variable overrides, then reports the grid track widths and the field width
    const measure = (page, overrides = {}) => page.evaluate(variables => {
      const form = document.querySelector('#high_flow')
      for (const [name, value] of Object.entries(variables)) form.style.setProperty(name, value)
      const list = form.querySelector('dl')
      return {
        columns: window.getComputedStyle(list).gridTemplateColumns.split(' ').map(width => Math.round(parseFloat(width))),
        field: Math.round(list.querySelector('div').getBoundingClientRect().width)
      }
    }, overrides)

    test.beforeEach(async ({ page }) => {
      // narrow enough that the columns have room to grow past the widths being tested
      await page.setViewportSize({ width: 800, height: 900 })
      await page.goto('/fullDemo.html')
    })

    test('should let columns fill the available width by default', async ({ page }) => {
      const { columns, field } = await measure(page)
      expect(columns.every(width => width > 365)).toBe(true)

      // the field is still held to the input max width inside its wider column
      expect(field).toBe(365)
    })

    test('should cap the columns when a column max width is set', async ({ page }) => {
      const { columns, field } = await measure(page, { '--semanticFormsInputColumnMaxWidth': '300px' })
      expect(columns.every(width => width === 300)).toBe(true)
      expect(field).toBe(300)
    })

    test('should cap the field independently of its column', async ({ page }) => {
      const { columns, field } = await measure(page, { '--semanticFormsInputMaxWidth': '280px' })

      // the columns are untouched; only the field sitting inside them is narrower
      expect(columns.every(width => width > 365)).toBe(true)
      expect(field).toBe(280)
    })
  })

  test.describe('switches', () => {
    test('should draw a checkbox with the [switch] attribute as a switch', async ({ page }) => {
      const switchInput = page.locator('#switch')

      // the native checkbox rendering is replaced by the track and thumb
      await expect(switchInput).toHaveCSS('appearance', 'none')
      await expect(switchInput).toHaveCSS('width', '34px')
      await expect(switchInput).toHaveCSS('height', '18px')
      await expect(switchInput).toHaveCSS('border-top-left-radius', '999px')

      // the thumb sits at the near end of the track while the switch is off
      await expect(switchInput).toHaveCSS('background-position', '0px 50%')
      await expect(switchInput).toHaveCSS('background-color', 'rgb(192, 192, 192)')
    })

    test('should report the switch role when the browser has no native support', async ({ page }) => {
      const nativeSupport = await page.evaluate(() => 'switch' in window.HTMLInputElement.prototype)

      // a browser that implements the attribute reports the role on its own, so it is not set
      if (nativeSupport) await expect(page.locator('#switch')).not.toHaveAttribute('role')
      else await expect(page.locator('#switch')).toHaveAttribute('role', 'switch')
    })

    test('should move the thumb across the track when switched on', async ({ page }) => {
      const switchInput = page.locator('#switch')
      await expect(switchInput).not.toBeChecked()

      await switchInput.click()
      await expect(switchInput).toBeChecked()
      await expect(switchInput).toHaveCSS('background-position', '16px 50%')
      await expect(switchInput).toHaveCSS('background-color', await switchOnColour(page))
    })

    test('should render a switch that is checked in the markup as on', async ({ page }) => {
      const switchInput = page.locator('#switch-checked')
      await expect(switchInput).toBeChecked()
      await expect(switchInput).toHaveCSS('background-position', '16px 50%')
      await expect(switchInput).toHaveCSS('background-color', await switchOnColour(page))
    })

    test('should not toggle a disabled switch', async ({ page }) => {
      const switchInput = page.locator('#switch-disabled')
      await expect(switchInput).toBeDisabled()
      await expect(switchInput).not.toBeChecked()

      await switchInput.click({ force: true })
      await expect(switchInput).not.toBeChecked()
    })

    test('should toggle a switch by dragging its thumb across the track', async ({ page }) => {
      const switchInput = page.locator('#switch')
      const changes = await trackToggleEvents(page, '#switch')
      await expect(switchInput).not.toBeChecked()

      await dragSwitch(page, switchInput, 24)
      await expect(switchInput).toBeChecked()

      // dragging back the other way turns it off again
      await dragSwitch(page, switchInput, -24)
      await expect(switchInput).not.toBeChecked()

      // a drag reports the same events a click would
      await expect.poll(() => changes()).toEqual(['input', 'change', 'input', 'change'])
    })

    test('should treat a pointer that barely moves as a click rather than a drag', async ({ page }) => {
      const switchInput = page.locator('#switch')
      await expect(switchInput).not.toBeChecked()

      // below the threshold that starts a drag, so the click still gets through
      await dragSwitch(page, switchInput, 3)
      await expect(switchInput).toBeChecked()
    })

    test('should style a switch in a lowFlow form, which runs no javascript', async ({ page }) => {
      await showLowFlowView(page)
      const switchInput = page.locator('#low-flow-switch')
      await expect(switchInput).toHaveCSS('width', '34px')
      await expect(switchInput).toHaveCSS('background-position', '0px 50%')

      // without javascript there is nothing to supply the role, so it stays an ordinary checkbox
      await expect(switchInput).not.toHaveAttribute('role')
    })

    test('should keep labels clear of the switch, which is wider than a checkbox', async ({ page }) => {
      // the label offsets are written for an 18px checkbox, and a switch is 34px wide, so both layouts need their own allowance for it or the text is printed over the control
      expect(await labelGap(page, '#switch')).toBeGreaterThan(0)

      // the two layouts are never on screen together, so the lowFlow one is measured after the demo has been switched over to it
      await showLowFlowView(page)
      expect(await labelGap(page, '#low-flow-switch')).toBeGreaterThan(0)

      // and the allowance should leave the same gap an ordinary checkbox gets
      expect(await labelGap(page, '#low-flow-switch')).toBe(await labelGap(page, '#low-flow-checkbox'))
    })
  })

  test.describe('style scoping', () => {
    test('should not style markup outside a semanticForms element', async ({ page }) => {
      // the library's promise is that it sets no global styles, so nothing in its stylesheet should match ordinary page markup that happens to use the same elements
      const stylesheet = fs.readFileSync(path.join(process.cwd(), 'dist', 'semantic-forms.css'), 'utf8')

      const matching = await page.evaluate(async css => {
        const outside = document.createElement('div')
        outside.innerHTML = `
          <form><fieldset><legend>Legend</legend>
            <dl><dt><label for="o1">A</label></dt><dd><input id="o1"></dd></dl>
          </fieldset></form>
          <table><thead><tr class="title"><th>T</th></tr></thead><tbody><tr><td><input id="o2"></td></tr></tbody></table>
          <dd class="checkboxes"><ul><li><input type="checkbox" id="o3"><label for="o3">c</label></li></ul></dd>
          <dd class="radios"><ul><li><input type="radio" id="o5"><label for="o5">r</label></li></ul></dd>
          <menu><li><button>b</button></li></menu>
          <details><summary>s</summary><p>x</p></details>
          <p><input id="o4"><label for="o4">p</label></p>`
        document.body.append(outside)

        const sheet = new window.CSSStyleSheet()
        await sheet.replace(css)

        const hits = []
        const walk = rules => {
          for (const rule of rules) {
            if (rule.cssRules) walk(rule.cssRules)
            if (!rule.selectorText) continue
            try {
              if (outside.querySelectorAll(rule.selectorText).length) hits.push(rule.selectorText)
            } catch (error) {
              // a selector this browser cannot parse cannot match either
            }
          }
        }
        walk(sheet.cssRules)
        outside.remove()
        return [...new Set(hits)]
      }, stylesheet)

      expect(matching).toEqual([])
    })
  })

  test.describe('forms inside a shadow root', () => {
    // builds a shadow root holding a semanticForms form, and enhances it by passing the root in
    const addShadowForm = page => page.evaluate(async () => {
      const host = document.createElement('div')
      host.id = 'shadow-host'
      document.body.append(host)
      const root = host.attachShadow({ mode: 'open' })

      // a shadow root does not inherit the page's stylesheets, so the consumer adopts them
      const sheet = new window.CSSStyleSheet()
      await sheet.replace(await (await window.fetch('/css/semantic-forms-styles.css')).text())
      root.adoptedStyleSheets = [sheet]

      root.innerHTML = `
        <form class="semanticForms" id="shadow-form">
          <dl>
            <div>
              <dt><label for="shadow-field">Shadow field</label></dt>
              <dd><input type="text" id="shadow-field" name="shadow-field" required></dd>
            </div>
          </dl>
        </form>`
      window.semanticForms(root)
    })

    // the tests read through the shadow boundary, which locators cannot cross by selector alone
    const inShadow = (page, selector, read) => page.evaluate(([sel, fn]) => {
      const root = document.querySelector('#shadow-host').shadowRoot
      // eslint-disable-next-line no-new-func
      return new Function('element', 'root', `return (${fn})(element, root)`)(root.querySelector(sel), root)
    }, [selector, read.toString()])

    test('should enhance a form in the shadow root it is given', async ({ page }) => {
      await addShadowForm(page)

      expect(await inShadow(page, '#shadow-form', form => form.classList.contains('semanticFormsActive'))).toBe(true)
      expect(await inShadow(page, '#shadow-field', field => field.classList.contains('semanticform'))).toBe(true)

      // the label lookup has to happen in the shadow tree, or the field is skipped entirely
      expect(await inShadow(page, '#shadow-field', (field, root) => !!root.querySelector('label.floatLabelFormAnimatedLabel'))).toBe(true)
      expect(await inShadow(page, '#shadow-field', (field, root) => !!root.querySelector('button.clear'))).toBe(true)
    })

    test('should leave the forms in the main document working', async ({ page }) => {
      await addShadowForm(page)

      // the shadow root gets its own observer rather than replacing the document's
      await expect(page.locator('#high_flow')).toContainClass('semanticFormsActive')
      expect(await page.evaluate(() => typeof window.semanticFormsObserver)).toBe('object')
    })

    test('should pick up a form added to the shadow root afterwards', async ({ page }) => {
      await addShadowForm(page)

      await page.evaluate(() => {
        document.querySelector('#shadow-host').shadowRoot.innerHTML += `
          <form class="semanticForms" id="shadow-form-2">
            <dl>
              <div>
                <dt><label for="shadow-field-2">Second</label></dt>
                <dd><input type="text" id="shadow-field-2" name="shadow-field-2"></dd>
              </div>
            </dl>
          </form>`
      })

      await expect.poll(() => inShadow(page, '#shadow-field-2', field => field.classList.contains('semanticform'))).toBe(true)
    })

    test('should reinitialize a form using the tree it belongs to', async ({ page }) => {
      await addShadowForm(page)

      await page.evaluate(() => {
        const root = document.querySelector('#shadow-host').shadowRoot
        root.querySelector('#shadow-form dl').insertAdjacentHTML('beforeend', `
          <div>
            <dt><label for="shadow-added">Added later</label></dt>
            <dd><input type="text" id="shadow-added" name="shadow-added"></dd>
          </div>`)
        window.semanticForms.reinitialize(root.querySelector('#shadow-form'))
      })

      expect(await inShadow(page, '#shadow-added', field => field.classList.contains('semanticform'))).toBe(true)
    })
  })

  test.describe('the reinitialize api', () => {
    test('should re-enhance a form that is passed to reinitialize', async ({ page }) => {
      // a field added to an already active form is not picked up on its own, because the mutation observer only reacts to whole forms being added to the page
      await page.evaluate(() => {
        document.querySelector('#high_flow dl').insertAdjacentHTML('beforeend', `
          <div>
            <dt><label for="reinit-field">Reinitialized field</label></dt>
            <dd><input id="reinit-field" name="reinit-field" type="text" required></dd>
          </div>`)
      })
      await expect(page.locator('#reinit-field')).not.toContainClass('semanticform')

      await page.evaluate(() => window.semanticForms.reinitialize(document.querySelector('#high_flow')))
      await expect(page.locator('#reinit-field')).toContainClass('semanticform')
      await expect(page.locator('label[for="reinit-field"].floatLabelFormAnimatedLabel span.required')).toHaveText('*')
    })

    test('should rescan for inactive forms when reinitialize is called with no arguments', async ({ page }) => {
      // with the observer disconnected, nothing enhances the new form until reinitialize runs
      await page.evaluate(() => {
        window.semanticFormsObserver.disconnect()
        document.body.insertAdjacentHTML('beforeend', `
          <form class="semanticForms" id="rescanned">
            <dl>
              <div>
                <dt><label for="rescanned-field">Rescanned field</label></dt>
                <dd><input id="rescanned-field" name="rescanned-field" type="text"></dd>
              </div>
            </dl>
          </form>`)
      })
      await expect(page.locator('#rescanned')).not.toContainClass('semanticFormsActive')

      await page.evaluate(() => window.semanticForms.reinitialize())
      await expect(page.locator('#rescanned')).toContainClass('semanticFormsActive')
      await expect(page.locator('label[for="rescanned-field"].floatLabelFormAnimatedLabel')).toBeVisible()
    })
  })

  test.describe('unsupported browsers', () => {
    test('should warn and leave forms untouched when a required feature is missing', async ({ page }) => {
      const warnings = []
      page.on('console', message => {
        if (message.type() === 'warning') warnings.push(message.text())
      })

      // getElementsByClassName is one of the features the library feature detects, and unlike the others nothing else on the demo page needs it
      await page.addInitScript(() => {
        Object.defineProperty(document, 'getElementsByClassName', { get: () => undefined })
      })
      await page.goto('/fullDemo.html')

      await expect.poll(() => warnings.some(warning => warning.includes('unsupported browser'))).toBe(true)
      await expect(page.locator('form.semanticForms').first()).not.toContainClass('semanticFormsActive')
    })
  })

  test.describe('platform specific keyboard shortcut symbols', () => {
    // the library reads navigator.platform to decide which modifier symbols to show
    const openDemoOn = async (page, platform) => {
      await page.addInitScript(value => {
        Object.defineProperty(window.navigator, 'platform', { get: () => value })
      }, platform)
      await page.goto('/fullDemo.html')
    }

    test('should use mac modifier symbols on macos', async ({ page }) => {
      await openDemoOn(page, 'MacIntel')
      const shortcuts = page.locator('#keyboard_shortcuts .focus-key kbd')
      await expect(shortcuts.nth(0)).toHaveText('⌘ P')
      await expect(shortcuts.nth(2)).toHaveText('⌥ P')

      // the default modifier resolves to command rather than control here
      await page.keyboard.press('Meta+P')
      await expect(page.locator('#custom-focus-input')).toBeFocused()
    })

    test('should fall back to the default modifier on an unrecognized platform', async ({ page }) => {
      await openDemoOn(page, 'SomeUnknownPlatform')
      // with no operating system detected there is no symbol to show, but the shortcut still renders
      await expect(page.locator('#keyboard_shortcuts .focus-key kbd').nth(0)).toHaveText(/P$/)
    })

    test('should use windows modifier symbols on windows', async ({ page }) => {
      await openDemoOn(page, 'Win32')
      const shortcuts = page.locator('#keyboard_shortcuts .focus-key kbd')
      await expect(shortcuts.nth(0)).toHaveText('Ctrl P')
      await expect(shortcuts.nth(2)).toHaveText('⎇ P')
      await expect(shortcuts.nth(3)).toHaveText('⊞ Y')
    })
  })

  test.describe('malformed markup', () => {
    test('should report an input that has no associated label and skip it', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="unlabelled">
          <dl>
            <div>
              <dt></dt>
              <dd><input id="unlabelled-input" name="unlabelled-input" type="text"></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('without a properly associated label'))).toBe(true)
      // the input is left alone rather than being half enhanced
      await expect(page.locator('#unlabelled-input')).not.toContainClass('semanticform')
    })

    test('should report a focus key longer than one character and use its first character', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="long-key-form">
          <dl>
            <div>
              <dt><label for="long-key">Long key</label></dt>
              <dd><input id="long-key" name="long-key" type="text" data-focus-key="ABC"></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('more than one character'))).toBe(true)
      await expect(page.locator('#long-key-form .focus-key kbd')).toHaveText(/ A$/)
    })

    test('should report an unrecognized focus modifier and fall back to the default', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="bad-modifier-form">
          <dl>
            <div>
              <dt><label for="bad-modifier">Bad modifier</label></dt>
              <dd><input id="bad-modifier" name="bad-modifier" type="text" data-focus-key="Q" data-focus-modifier="bogus"></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('unrecognized modifier'))).toBe(true)
      await expect(page.locator('#bad-modifier-form .focus-key kbd')).toHaveText(/ Q$/)
    })

    test('should support a punctuation focus key with the alt modifier', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="punctuation-shortcut-form">
          <dl>
            <div>
              <dt><label for="punctuation-shortcut">Punctuation</label></dt>
              <dd><input id="punctuation-shortcut" name="punctuation-shortcut" type="text" data-focus-key="-" data-focus-modifier="alt"></dd>
            </div>
          </dl>
        </form>`)

      await expect(page.locator('#punctuation-shortcut-form .focus-key kbd')).toHaveText(/ -$/)
      await page.keyboard.press('Alt+Minus')
      await expect(page.locator('#punctuation-shortcut')).toBeFocused()
    })

    test('should report a duplicate keyboard shortcut', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="duplicate-shortcut-form">
          <dl>
            <div>
              <dt><label for="duplicate-one">First</label></dt>
              <dd><input id="duplicate-one" name="duplicate-one" type="text" data-focus-key="Z"></dd>
            </div>
            <div>
              <dt><label for="duplicate-two">Second</label></dt>
              <dd><input id="duplicate-two" name="duplicate-two" type="text" data-focus-key="Z"></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('Duplicate keyboard shortcut'))).toBe(true)
    })

    test('should report an input that is not inside a dd', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      await addForm(page, `
        <form class="semanticForms" id="no-dd-form">
          <dl>
            <dt><label for="no-dd-input">No dd</label></dt>
            <input id="no-dd-input" name="no-dd-input" type="text">
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('does not have a corresponding <dd> element'))).toBe(true)
    })

    test('should report a checkbox that is not inside a dd', async ({ page }) => {
      const errors = watchConsole(page, 'error')

      // the form deliberately has no id, so that the label is matched by "for" rather than by the "data-for" lookup a checkbox group would otherwise use
      await addForm(page, `
        <form class="semanticForms">
          <dl>
            <dt><label for="no-dd-checkbox">No dd</label></dt>
            <input id="no-dd-checkbox" name="no-dd-checkbox" type="checkbox">
          </dl>
        </form>`)

      await expect.poll(() => errors.some(error => error.includes('not inside a <dd> element'))).toBe(true)
    })

    test('should warn about an invalid [data-max-rows] value and ignore it', async ({ page }) => {
      const warnings = watchConsole(page, 'warning')

      await addForm(page, `
        <form class="semanticForms" id="bad-rows-form">
          <dl>
            <div>
              <dt><label for="bad-rows">Bad rows</label></dt>
              <dd><textarea id="bad-rows" name="bad-rows" data-max-rows="not a number">one</textarea></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => warnings.some(warning => warning.includes('data-max-rows'))).toBe(true)
    })
  })

  test.describe('generated wrappers', () => {
    // returns the label of each field in a form, in the order they appear in the dom
    const fieldOrder = (page, selector) => page.evaluate(target =>
      [...document.querySelectorAll(`${target} dl > div`)].map(field => field.querySelector('dt label')?.textContent), selector)

    test('should leave fields in the order they were written', async ({ page }) => {
      // buttons are not enhanced, so nothing moves them. enhanced fields must not be moved either, or they end up ordered after everything the enhancer leaves alone
      await addForm(page, `
        <form class="semanticForms" id="ordering-form">
          <dl>
            <div>
              <dt><label for="order-first">First</label></dt>
              <dd><input type="text" id="order-first" name="order-first"></dd>
            </div>
            <div>
              <dt><label for="order-button">Button</label></dt>
              <dd><button id="order-button">Some button</button></dd>
            </div>
            <div>
              <dt><label for="order-third">Third</label></dt>
              <dd><input type="text" id="order-third" name="order-third"></dd>
            </div>
            <div>
              <dt><label for="order-submit">Submit</label></dt>
              <dd><input type="submit" id="order-submit" value="Go"></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => fieldOrder(page, '#ordering-form'))
        .toEqual(['First', 'Button', 'Third', 'Submit'])
    })

    test('should keep order when some fields are wrapped and others are not', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="mixed-ordering-form">
          <dl>
            <dt><label for="mixed-one">One</label></dt>
            <dd><input type="text" id="mixed-one" name="mixed-one"></dd>
            <div>
              <dt><label for="mixed-two">Two</label></dt>
              <dd><input type="text" id="mixed-two" name="mixed-two"></dd>
            </div>
            <dt><label for="mixed-three">Three</label></dt>
            <dd><input type="checkbox" id="mixed-three" name="mixed-three"></dd>
            <div>
              <dt><label for="mixed-four">Four</label></dt>
              <dd><button id="mixed-four">Button</button></dd>
            </div>
          </dl>
        </form>`)

      await expect.poll(() => fieldOrder(page, '#mixed-ordering-form'))
        .toEqual(['One', 'Two', 'Three', 'Four'])

      // and everything that was loose in the dl ends up inside a wrapper
      await expect(page.locator('#mixed-ordering-form dl > dt')).toHaveCount(0)
      await expect(page.locator('#mixed-ordering-form dl > dd')).toHaveCount(0)
    })

    test('should wrap a dt and dd that the author did not wrap in a div', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="unwrapped-form">
          <dl>
            <dt><label for="unwrapped-input">Unwrapped</label></dt>
            <dd><input id="unwrapped-input" name="unwrapped-input" type="text"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#unwrapped-form dl > div > dt')).toBeAttached()
      await expect(page.locator('#unwrapped-form dl > div > dd > #unwrapped-input')).toBeAttached()
    })

    test('should move a colspan class from the dd onto the generated wrapper', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="colspan-form">
          <dl>
            <dt><label for="colspan-input">Colspan</label></dt>
            <dd class="colspan-2"><input id="colspan-input" name="colspan-input" type="text"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#colspan-form dl > div')).toContainClass('colspan-2')
      await expect(page.locator('#colspan-form dd')).not.toContainClass('colspan-2')
    })

    test('should hide the generated wrapper when both the dt and dd are hidden', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="hidden-wrapper-form">
          <dl>
            <dt style="display: none;"><label for="hidden-input">Hidden</label></dt>
            <dd style="display: none;"><input id="hidden-input" name="hidden-input" type="text"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#hidden-wrapper-form dl > div')).toHaveCSS('display', 'none')
    })

    test('should wrap and mark a single checkbox that the author did not wrap in a div', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="single-checkbox-form">
          <dl>
            <dt><label for="lone-checkbox">Lone checkbox</label></dt>
            <dd><input id="lone-checkbox" name="lone-checkbox" type="checkbox"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#single-checkbox-form dl > div > dd')).toContainClass('singleCheckbox')
      await expect(page.locator('#single-checkbox-form dd label[for="lone-checkbox"]')).toBeAttached()
    })

    test('should hide the generated wrapper of a hidden single checkbox', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="hidden-checkbox-form">
          <dl>
            <dt style="display: none;"><label for="hidden-checkbox">Hidden checkbox</label></dt>
            <dd style="display: none;"><input id="hidden-checkbox" name="hidden-checkbox" type="checkbox"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#hidden-checkbox-form dl > div')).toHaveCSS('display', 'none')
    })

    test('should leave a checkbox group alone when its dd already has a label', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="labelled-group-form">
          <dl>
            <div>
              <dt><label data-for="labelled-group">Group</label></dt>
              <dd id="labelled-group">
                <label for="grouped-checkbox">Already labelled</label>
                <ul><li><input id="grouped-checkbox" name="grouped-checkbox" type="checkbox"></li></ul>
              </dd>
            </div>
          </dl>
        </form>`)

      // the existing label is reused rather than a second one being appended
      await expect(page.locator('#labelled-group > label')).toHaveCount(1)
    })

    test('should wrap and mark a single radio that the author did not wrap in a div', async ({ page }) => {
      await addForm(page, `
        <form class="semanticForms" id="single-radio-form">
          <dl>
            <dt><label for="lone-radio">Lone radio</label></dt>
            <dd><input id="lone-radio" name="lone-radio" type="radio"></dd>
          </dl>
        </form>`)

      await expect(page.locator('#single-radio-form dl > div > dd')).toContainClass('singleRadio')
    })
  })
})
