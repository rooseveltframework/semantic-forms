const { insertAfter } = require('./helpers.js')

const icons = {
  passwordShow: '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m1 12s4-8 11-8 11 8 11 8"/><path d="m1 12s4 8 11 8 11-8 11-8"/><circle cx="12" cy="12" r="3"/></g></svg>',
  passwordHide: '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 2 20 20"/><path d="m6.71277 6.7226c-3.04798 2.07267-4.71277 5.2774-4.71277 5.2774s3.63636 7 10 7c2.0503 0 3.8174-.7266 5.2711-1.7116m-6.2711-12.23018c.3254-.03809.6588-.05822 1-.05822 6.3636 0 10 7 10 7s-.6918 1.3317-2 2.8335"/><path d="m14 14.2362c-.5308.475-1.2316.7639-2 .7639-1.6569 0-3-1.3431-3-3 0-.8237.33193-1.5698.86932-2.11192"/></g></svg>',
  helpIcon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" version="1.1" style="overflow:visible;"><rect width="16" height="16" fill="none"/><path fill="currentColor" d="M8,10.5c-0.552,0-1,0.448-1,1c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1C9,10.948,8.552,10.5,8,10.5z M8,0 C3.582,0,0,3.582,0,8c0,4.418,3.582,8,8,8s8-3.582,8-8C16,3.582,12.418,0,8,0z M12.243,12.243C11.109,13.376,9.603,14,8,14 s-3.109-0.624-4.243-1.757C2.624,11.109,2,9.603,2,8s0.624-3.109,1.757-4.243C4.891,2.624,6.397,2,8,2s3.109,0.624,4.243,1.757 C13.376,4.891,14,6.397,14,8C14,9.603,13.376,11.109,12.243,12.243z M7.927,3.755c-2.248,0-2.76,1.695-2.802,2.906h1.571 c0.028-0.256,0.101-1.418,1.221-1.418c0.672,0,1.206,0.406,1.206,1.175c0,0.695-0.724,1.155-1.303,1.711 C7.241,8.685,7.168,9.325,7.168,9.824V10c0.146,0,1.615,0,1.615,0V9.824c0-1.256,1.967-1.594,1.967-3.541 C10.75,5.059,9.874,3.755,7.927,3.755z"/></svg>'
}

const lookups = {
  nodeName: ['TEXTAREA', 'SELECT'],
  inputType: ['checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'image', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']
}

let lastFocusedInput
let lastClearFieldPressed

// browsers that implement the switch attribute expose it on the input prototype, render the control as a switch and report the switch role themselves, so nothing below is needed there
const nativeSwitchSupport = 'switch' in window.HTMLInputElement.prototype

// lets a polyfilled switch be toggled by dragging its thumb, which is what the native control does. a pointer that never travels far enough is left alone so it still lands as a click.
const enableSwitchDragging = (input) => {
  input.addEventListener('pointerdown', event => {
    if (input.disabled) return

    const startX = event.clientX
    const rightToLeft = window.getComputedStyle(input).direction === 'rtl'
    // half the track is the distance the thumb travels between the two positions
    const travel = input.clientWidth / 2 || 1
    const wasChecked = input.checked
    let dragging = false

    input.setPointerCapture(event.pointerId)

    const drag = moveEvent => {
      const distance = rightToLeft ? startX - moveEvent.clientX : moveEvent.clientX - startX
      if (!dragging && Math.abs(distance) <= 5) return // still within a click
      dragging = true
      moveEvent.preventDefault() // don't select or scroll while dragging
      input.checked = (wasChecked ? 1 : 0) + (distance / travel) > 0.5
    }

    const drop = upEvent => {
      input.releasePointerCapture(upEvent.pointerId)
      input.removeEventListener('pointermove', drag)
      input.removeEventListener('pointerup', drop)
      input.removeEventListener('pointercancel', drop)
      if (!dragging) return

      // the click that follows the drag would otherwise put the switch back where it started
      input.addEventListener('click', clickEvent => clickEvent.preventDefault(), { once: true, capture: true })

      if (input.checked !== wasChecked) {
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    input.addEventListener('pointermove', drag)
    input.addEventListener('pointerup', drop)
    input.addEventListener('pointercancel', drop)
  })
}

// turns a text input with the data-auto-grow attribute into a textarea, and makes enter submit the form from it
//
// returns the field, which is the new textarea when one was made
const enhanceAutoGrow = (input, form) => {
  if (input.getAttribute('data-auto-grow') === null) return input

  // progressively enhance inputs into textareas
  if (input.nodeName === 'INPUT' && input.type === 'text') {
    // the textarea takes over everything the input had except what only an input has, so its name, its class, whether it's required, and so on all carry over
    const newInput = document.createElement('textarea')
    for (const attribute of input.attributes) if (!['type', 'value', 'size', 'list', 'pattern'].includes(attribute.name)) newInput.setAttribute(attribute.name, attribute.value)
    newInput.value = input.value
    input.replaceWith(newInput)
    input = newInput
  }

  if (input.nodeName === 'TEXTAREA') {
    // when pressing enter while this input is focused, we want to submit
    input.addEventListener('keypress', (e) => {
      if (e.key !== 'Enter' || (e.key === 'Enter' && e.shiftKey)) return
      e.preventDefault()
      form.requestSubmit()
    })
  }

  return input
}

// the behavior of the control itself, as opposed to the labels and buttons placed around it: switches and textareas. this is all a field in a customLayout element gets, and every other field gets it too
const enhanceControl = (input, type, form) => {
  // a checkbox with the switch attribute is a switch; the stylesheet draws one in every browser, and where the attribute is not implemented natively the role and dragging are supplied here
  if (type === 'checkbox' && input.hasAttribute('switch') && !nativeSwitchSupport) {
    input.setAttribute('role', 'switch')
    enableSwitchDragging(input)
  }

  // add listener to shift clear button when scrollbar present
  if (input.nodeName === 'TEXTAREA') {
    if (input.getAttribute('data-disable-autosize') === null) {
      // add auto-sizing
      input.style.setProperty('resize', 'none')
      input.style.setProperty('min-height', '0')
      input.style.setProperty('max-height', 'none')
      input.style.setProperty('height', 'auto')

      const handleInput = () => {
        // reset rows attribute to get accurate scrollHeight
        let maxRows = input.getAttribute('data-max-rows')

        if (maxRows) {
          if (isNaN(maxRows) || Number(maxRows) <= 0) {
            console.warn(`An invalid value was passed to the "data-max-rows" attribute. This value will be ignored.\n\nProvided value: ${input.getAttribute('data-max-rows')}`)
            maxRows = null
          }
        }

        const minRows = input.getAttribute('data-max-rows') && Number(input.getAttribute('data-max-rows')) < 5 ? input.getAttribute('data-max-rows') : '5'
        input.setAttribute('rows', minRows)

        // get the computed values object reference
        const style = window.getComputedStyle(input)

        // force content-box for size accurate line-height calculation, remove scrollbars, lock width (subtract inline padding and inline border widths), and remove inline padding and borders to keep width consistent (for text wrapping accuracy)
        const inlinePadding = parseFloat(style['padding-left']) + parseFloat(style['padding-right'])
        const inlineBorderWidth = parseFloat(style['border-left-width']) + parseFloat(style['border-right-width'])
        input.style.setProperty('overflow', 'hidden', 'important')
        input.style.setProperty('width', (parseFloat(style.width) - inlinePadding - inlineBorderWidth) + 'px')
        input.style.setProperty('box-sizing', 'content-box')
        input.style.setProperty('padding-inline', '0')
        input.style.setProperty('border-width', '0')

        // get the base line height, and top / bottom padding
        const blockPadding = parseFloat(style['padding-top']) + parseFloat(style['padding-bottom'])
        const lineHeight = style['line-height'] === 'normal'
          ? parseFloat(style.height) // if line-height is not explicitly set, use the computed height value (ignore padding due to content-box)
          : parseFloat(style['line-height']) // otherwise (line-height is explicitly set), use the computed line-height value

        // get the scroll height (rounding to be safe to ensure cross browser consistency)
        const scrollHeight = Math.round(input.scrollHeight)

        // undo overflow, width, border-width, box-sizing & inline padding overrides
        input.style.removeProperty('width')
        input.style.removeProperty('box-sizing')
        input.style.removeProperty('padding-inline')
        input.style.removeProperty('border-width')
        input.style.removeProperty('overflow')

        // subtract blockPadding from scrollHeight and divide that by our lineHeight to get the row count, round to nearest integer as it will always be within ~.1 of the correct whole number
        const rows = Math.round((scrollHeight - blockPadding) / lineHeight)

        // set the calculated rows attribute (limited by rowLimit)
        if (maxRows) {
          input.setAttribute('rows', '' + Math.min(rows, Number(maxRows)))
        } else {
          input.setAttribute('rows', '' + rows)
        }
      }

      input.addEventListener('input', handleInput)

      // set the initial rows value. this calls the sizing directly rather than firing an input event, which would tell the app's own listeners the user had changed the field
      handleInput()
    }

    // progressively enhance textarea for Firefox and Safari
    // this may be removed once fully supported in Firefox and Safari: https://caniuse.com/wf-field-sizing
    if (input.getAttribute('data-auto-grow') !== null) {
      if (!('fieldSizing' in document.createElement('input').style)) {
        const adjustHeight = () => {
          if (input.value.length) {
            const borderWidth = parseInt(window.getComputedStyle(input).getPropertyValue('border-width'))
            input.style.height = (input.scrollHeight + (borderWidth * 2)) + 'px'
          } else {
            input.style.height = window.getComputedStyle(form).getPropertyValue('--semanticFormsInputHeight')
          }
        }

        // set initial height to semantic-forms CSS variable
        input.style.height = window.getComputedStyle(form).getPropertyValue('--semanticFormsInputHeight')
        input.addEventListener('input', adjustHeight)
      }
    }

    // shifts the clear button to the right if a scrollbar is present
    const shiftClearBtn = () => {
      const clearBtn = input.parentElement?.querySelector('button.clear')
      if (clearBtn) clearBtn.style.marginRight = input.clientHeight < input.scrollHeight ? '15px' : ''
    }
    input.addEventListener('input', shiftClearBtn)
    input.addEventListener('mouseup', shiftClearBtn)
    shiftClearBtn()
  }
}

const enhanceInput = (input, form) => {
  // ignore input if it has previously been formatted
  if (input.classList.contains('semanticform')) return

  const type = input.getAttribute('type')
  if (!lookups.nodeName.includes(input.nodeName) && !lookups.inputType.includes(type)) return

  // a field without an id has no label to float or place buttons beside, but the control itself is still enhanced, such as a switch being given its role and dragging
  if (!input.id) {
    input.classList.add('semanticform')
    enhanceControl(input, type, form)
    return
  }

  // inside a customLayout element the app lays out the <dl> itself, so nothing is added, moved or rewritten around the field: no float label, no clear or show password button, no wrapping <div>, no required asterisk or help icon, and no value appended to the label of a range. the control itself is still enhanced. it is marked like any other enhanced field so that reinitializing does not enhance it twice
  if (input.closest('.customLayout')) {
    input.classList.add('semanticform')
    input = enhanceAutoGrow(input, form)
    enhanceControl(input, type, form)
    if (type === 'range' && input.getAttribute('data-display-value') !== null) displayRangeValue(input, null)
    return
  }

  // recursively find <dl> element
  let dl = input.parentNode
  while (dl && dl.nodeName !== 'DL') dl = dl.parentNode
  if (!dl) return
  if (!dl.classList.contains('floatLabelForm')) dl.classList.add('floatLabelForm')

  // the label is looked up in the input's own tree rather than the document, so that a form inside a shadow root finds its labels instead of coming up empty
  const tree = input.getRootNode()
  const label = input.parentNode.parentNode.id && (type === 'checkbox' || type === 'radio')
    ? tree.querySelector(`label[data-for="${window.CSS.escape(input.parentNode.parentNode.id)}"]`)
    : tree.querySelector(`label[for="${window.CSS.escape(input.id)}"]`)

  if (!label) {
    console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) without a properly associated label. Make sure there is a label for it and the label has a matching "for" attribute.`)
    return
  }

  input.classList.add('semanticform')

  // an input outside a <dd> is reported by the checks further down, so tolerate it here
  const isWrapped = input.closest('dd')?.parentElement.nodeName === 'DIV'

  // #region create labels

  const newLabel = document.createElement('label')
  newLabel.className = 'floatLabelFormAnimatedLabel'

  if (type === 'checkbox' || type === 'radio') {
    const div = isWrapped ? input.closest('dd').parentElement : document.createElement('div')
    const dt = label.closest('dt')
    const dd = input.closest('dd')

    if (!dt || !dd) {
      console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that is not inside a <dd> element.`)
      return
    }

    if (dd.firstChild.nodeName !== 'LABEL') {
      if (type === 'checkbox' && input.parentNode.nodeName === 'DD') {
        newLabel.setAttribute('for', input.id)
        input.parentNode.classList.add('singleCheckbox')
        newLabel.className = ''
        label.setAttribute('hidden', 'hidden')
        insertAfter(newLabel, input)
      }

      if (type === 'radio' && input.parentNode.nodeName === 'DD') {
        newLabel.setAttribute('for', input.id)
        input.parentNode.classList.add('singleRadio')
        newLabel.className = ''
        label.setAttribute('hidden', 'hidden')
        insertAfter(newLabel, input)
      }

      newLabel.innerHTML = label.innerHTML

      if (label.hasAttribute('title') && label.getAttribute('data-show-help-icon') !== null && !label.querySelector('span.help')) {
        const text = label.getAttribute('title')
        appendBadge(label, 'help', text, icons.helpIcon)
        appendBadge(newLabel, 'help', text, icons.helpIcon)
      }

      if (dd.querySelector(':required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span.required')) {
        const text = label.getAttribute('data-asterisk-text') || 'This field is required.'
        appendBadge(label, 'required', text, '*')
        appendBadge(newLabel, 'required', text, '*')
      }

      if (!dd.querySelector('label')) dd.append(newLabel)
    }

    // if the user did not wrap the input in a div, do it for them
    if (!isWrapped) {
      // the wrapper goes where the <dt> was, so the field keeps its place in the markup. a div the author wrote is already in the right place and is deliberately left where it is: moving it would push the field past anything the enhancer does not touch, such as a <dd> holding only a button
      dt.before(div)
      div.append(dt, dd)

      // determine visibility of newly created <div>
      if (dt.style.display === 'none' && dd.style.display === 'none') div.style.display = 'none'
    }
  } else {
    newLabel.setAttribute('for', input.id)
    newLabel.innerHTML = label.innerHTML

    if (input.hasAttribute('title') && label.getAttribute('data-show-help-icon') !== null && !label.querySelector('span.help')) {
      appendBadge(newLabel, 'help', input.getAttribute('title'), icons.helpIcon)
    }

    if (input.hasAttribute('required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span.required')) {
      appendBadge(newLabel, 'required', label.getAttribute('data-asterisk-text') || 'This field is required.', '*')
    }

    label.setAttribute('hidden', 'hidden')

    insertAfter(newLabel, input)
  }
  // #endregion

  // #region standard inputs

  input = enhanceAutoGrow(input, form)

  if (type !== 'checkbox' && type !== 'radio') {
    if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', ' ')

    const div = isWrapped ? input.closest('dd').parentElement : document.createElement('div')
    const dt = label.closest('dt')
    const dd = input.closest('dd')

    if (!dt || !dd) {
      console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that does not have a corresponding ${!dt ? '<dt>' : '<dd>'} element.`)
      return
    }

    // input clear button. a field the user cannot edit does not get one, since the button would empty it anyway. a field that only becomes uneditable later is handled in css
    if (input.nodeName !== 'SELECT' && type !== 'range' && !input.readOnly && !input.disabled) {
      const clearBtn = document.createElement('button')
      clearBtn.type = 'button'
      clearBtn.title = input.getAttribute('data-clear-field-text') || 'Clear field'
      clearBtn.ariaLabel = input.getAttribute('data-clear-field-text') || 'Clear field'
      clearBtn.tabIndex = -1
      clearBtn.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M 1 1 L 15 15 M 1 15 L 15 1" fill="none" stroke-width="2" stroke="currentColor" />'
      clearBtn.classList.add('clear')
      clearBtn.setAttribute('data-semantic-forms-clear', '') // (what marks it as a clear button, whatever its title says)
      clearBtn.id = `semanticFormsClearButton_${input.id}`
      clearBtn.addEventListener('click', () => {
        input.previousValue = input.value
        input.value = ''
        input.focus()
        lastClearFieldPressed = input.id

        // the field has been changed, as typing in it and leaving it would change it, so it says so the same way
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
      insertAfter(clearBtn, dd.querySelector('label'))
    }

    input.addEventListener('focus', event => {
      if (event.target.nodeName === 'INPUT') lastFocusedInput = event.target
    })

    // the colspan- and col- utility classes are documented as going on the dd, but they size and place the grid item, which is the div wrapping it, so move any of them across
    for (const utility of dd.className.match(/colspan-(?:[0-9]|full)|col-[0-9]/g) || []) {
      dd.classList.remove(utility)
      div.classList.add(utility)
    }

    // check for max-content attribute
    // this may be removed once fully supported in Firefox and Safari: https://caniuse.com/wf-field-sizing
    if (input.getAttribute('data-max-content') !== null) {
      if (!('fieldSizing' in document.createElement('input').style)) {
        const adjustWidth = () => {
          const value = input.value !== '' ? input.value : input.placeholder
          const width = value.length * 8 + 40
          input.style.width = width + 'px'
          input.style.maxWidth = '100%'
        }
        adjustWidth()
        input.addEventListener('input', adjustWidth)
      }
    }

    // if the user did not wrap the input in a div, do it for them
    if (!isWrapped) {
      // as above, the wrapper takes the <dt>'s position rather than being appended to the end
      dt.before(div)
      div.append(dt, dd)

      // determine visibility of newly created <div>
      if (dt.style.display === 'none' && dd.style.display === 'none') div.style.display = 'none'
    }
  }
  // #endregion

  // handle file input clear btn, cannot be handled with CSS
  if (type === 'file') {
    const clearBtn = input.parentElement.querySelector('.clear')
    input.addEventListener('input', event => {
      clearBtn.style.display = event.target.files.length ? 'flex' : 'none'
    })
    clearBtn.addEventListener('click', () => {
      clearBtn.style.display = 'none'
    })
  }

  // handle range inputs set to display the value. every other per-field flag in the library is a data attribute, so that is the documented way to ask for this, but the original `displayValue` class is still honored
  if (type === 'range' && (input.getAttribute('data-display-value') !== null || input.classList.contains('displayValue'))) {
    displayRangeValue(input, input.parentNode.parentNode.querySelector('dd label'))
  }

  // show password button
  if (type === 'password' && input.getAttribute('data-no-reveal') === null) {
    const showBtn = document.createElement('button')
    showBtn.type = 'button'
    showBtn.title = input.getAttribute('data-show-password-text') || 'Show password'
    showBtn.ariaLabel = input.getAttribute('data-show-password-text') || 'Show password'
    showBtn.tabIndex = -1
    showBtn.innerHTML = icons.passwordShow
    showBtn.classList.add('show')
    showBtn.id = `semanticFormsShowButton_${input.id}`
    const dd = input.closest('dd')
    if (!dd) {
      console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that is not inside a <dd> element.`)
      return
    }
    showBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        showBtn.innerHTML = icons.passwordHide
        showBtn.title = input.getAttribute('data-hide-password-text') || 'Hide password'
        showBtn.ariaLabel = input.getAttribute('data-hide-password-text') || 'Hide password'
        input.type = 'text'
      } else {
        showBtn.innerHTML = icons.passwordShow
        showBtn.title = input.getAttribute('data-show-password-text') || 'Show password'
        showBtn.ariaLabel = input.getAttribute('data-show-password-text') || 'Show password'
        input.type = 'password'
      }
      input.focus()
    })
    insertAfter(showBtn, dd.querySelector('label'))
  }

  enhanceControl(input, type, form)
}

// appends a help icon or a required asterisk to a label, with its title set as text, so a title holding quotes or markup is shown as it is rather than breaking the label
const appendBadge = (label, className, title, content) => {
  const badge = document.createElement('span')
  badge.className = className
  badge.title = title
  badge.innerHTML = content // (the library's own icon, or an asterisk)
  label.append(' ', badge)
}

// shows a range's value as it moves, formatted by its data-display-format attribute, in which {value} stands for the value, such as "{value}%"
//
// in a float label form the value goes after the label; in a customLayout element, where nothing is added around a field, it goes in the <output> for the range, if the page has one
const displayRangeValue = (input, label) => {
  const format = () => (input.getAttribute('data-display-format') || '{value}').replaceAll('{value}', input.value)
  let output
  if (label) {
    const separator = document.createElement('span')
    separator.className = 'seperator'
    separator.textContent = ': '
    output = document.createElement('output')
    label.append(separator, output)
  } else {
    output = input.getRootNode().querySelector(`output[for="${window.CSS.escape(input.id)}"]`)
    if (!output) return
  }
  output.textContent = format()
  input.addEventListener('input', () => { output.textContent = format() })
}

// marks a field invalid, which the stylesheet outlines, with a message saying why, which screen readers read along with the field. options.messageIn is the element to put the message in; by default it goes after the field, where the stylesheet shows it
//
// calling it again replaces the message, and clearInvalid undoes it
const setInvalid = (input, message, options = {}) => {
  input.classList.add('invalid')
  input.setAttribute('aria-invalid', 'true')
  const id = `${input.id || 'semanticFormsField'}SemanticFormsInvalid`
  let text = input.getRootNode().getElementById?.(id) || document.getElementById(id)
  if (!text) {
    text = document.createElement('p')
    text.id = id
    text.className = 'semanticFormsInvalidText'
    if (options.messageIn) options.messageIn.append(text)
    else input.parentNode.append(text)
  }
  text.textContent = message
  const describedBy = (input.getAttribute('aria-describedby') || '').split(' ').filter(token => token && token !== id)
  input.setAttribute('aria-describedby', [...describedBy, id].join(' '))
}

const clearInvalid = (input) => {
  input.classList.remove('invalid')
  input.removeAttribute('aria-invalid')
  const id = `${input.id || 'semanticFormsField'}SemanticFormsInvalid`
  const text = input.getRootNode().getElementById?.(id) || document.getElementById(id)
  text?.remove()
  const describedBy = (input.getAttribute('aria-describedby') || '').split(' ').filter(token => token && token !== id)
  if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '))
  else input.removeAttribute('aria-describedby')
}

const handleUndoRedo = (event) => {
  // handle undo/redo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    // undo clearing a field
    if (lastFocusedInput) {
      if (lastFocusedInput?.parentNode?.querySelector('button.clear')?.id === `semanticFormsClearButton_${lastClearFieldPressed}` || lastFocusedInput?.parentNode?.querySelector('button.clear')?.name === `semanticFormsClearButton_${lastClearFieldPressed}`) {
        if (lastFocusedInput.previousValue) {
          // the browser undoes the field's own edit history on this key too, which would apply on top of the value restored here, so the native behavior is suppressed
          event.preventDefault()
          lastFocusedInput.redoValue = lastFocusedInput.value
          lastFocusedInput.value = lastFocusedInput.previousValue
        }
      }
    }
  } else {
    if ((event.ctrlKey && event.key === 'y') || (event.metaKey && event.shiftKey && event.key === 'z')) {
      // redo clearing a field
      if (lastFocusedInput) {
        if (lastFocusedInput?.parentNode?.querySelector('button.clear')?.id === `semanticFormsClearButton_${lastClearFieldPressed}` || lastFocusedInput?.parentNode?.querySelector('button.clear')?.name === `semanticFormsClearButton_${lastClearFieldPressed}`) {
          if (lastFocusedInput.redoValue) {
            // as above, the browser's own redo would otherwise apply on top of this
            event.preventDefault()
            lastFocusedInput.previousValue = lastFocusedInput.value
            lastFocusedInput.value = lastFocusedInput.redoValue
          }
        }
      }
    }
  }
}

module.exports = { enhanceInput, handleUndoRedo, setInvalid, clearInvalid }
