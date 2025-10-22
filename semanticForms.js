const semanticForms = () => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) {
    console.warn('semantic-forms was loaded into an unsupported browser and will not execute.')
    return
  }

  const passwordShow = '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m1 12s4-8 11-8 11 8 11 8"/><path d="m1 12s4 8 11 8 11-8 11-8"/><circle cx="12" cy="12" r="3"/></g></svg>'
  const passwordHide = '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 2 20 20"/><path d="m6.71277 6.7226c-3.04798 2.07267-4.71277 5.2774-4.71277 5.2774s3.63636 7 10 7c2.0503 0 3.8174-.7266 5.2711-1.7116m-6.2711-12.23018c.3254-.03809.6588-.05822 1-.05822 6.3636 0 10 7 10 7s-.6918 1.3317-2 2.8335"/><path d="m14 14.2362c-.5308.475-1.2316.7639-2 .7639-1.6569 0-3-1.3431-3-3 0-.8237.33193-1.5698.86932-2.11192"/></g></svg>'
  const helpTextIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" version="1.1" style="overflow:visible;"><rect width="16" height="16" fill="none"/><path fill="currentColor" d="M8,10.5c-0.552,0-1,0.448-1,1c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1C9,10.948,8.552,10.5,8,10.5z M8,0 C3.582,0,0,3.582,0,8c0,4.418,3.582,8,8,8s8-3.582,8-8C16,3.582,12.418,0,8,0z M12.243,12.243C11.109,13.376,9.603,14,8,14 s-3.109-0.624-4.243-1.757C2.624,11.109,2,9.603,2,8s0.624-3.109,1.757-4.243C4.891,2.624,6.397,2,8,2s3.109,0.624,4.243,1.757 C13.376,4.891,14,6.397,14,8C14,9.603,13.376,11.109,12.243,12.243z M7.927,3.755c-2.248,0-2.76,1.695-2.802,2.906h1.571 c0.028-0.256,0.101-1.418,1.221-1.418c0.672,0,1.206,0.406,1.206,1.175c0,0.695-0.724,1.155-1.303,1.711 C7.241,8.685,7.168,9.325,7.168,9.824V10c0.146,0,1.615,0,1.615,0V9.824c0-1.256,1.967-1.594,1.967-3.541 C10.75,5.059,9.874,3.755,7.927,3.755z"/></svg>'

  const nodeNameLookup = ['TEXTAREA', 'SELECT']
  const inputTypeLookup = ['checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'image', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']
  const keyboardShortcuts = []

  // custom keyboard shortcut listener
  document.addEventListener('keydown', (e) => {
    const specialCharMap = {
      Minus: '-',
      Equal: '=',
      BracketLeft: '[',
      BracketRight: ']',
      Backslash: '\\',
      Semicolon: ';',
      Quote: '\'',
      Comma: ',',
      Period: '.',
      Slash: '/',
      Backquote: '`'
    }

    const shiftSpecialCharMap = {
      1: '!',
      2: '@',
      3: '#',
      4: '$',
      5: '%',
      6: '^',
      7: '&',
      8: '*',
      9: '(',
      0: ')',
      Minus: '_',
      Equal: '+',
      BracketLeft: '{',
      BracketRight: '}',
      Backslash: '|',
      Semicolon: ':',
      Quote: '"',
      Comma: '<',
      Period: '>',
      Slash: '?',
      Backquote: '~'
    }

    const shortcut = keyboardShortcuts.find(shortcut => {
      let matchesKey = false
      if (e.altKey && !e.shiftKey) {
        // mac adjusts the key value if altKey is pressed
        matchesKey = 'Key' + shortcut.key.toUpperCase() === e.code ||
          'Digit' + shortcut.key.toUpperCase() === e.code ||
          shortcut.key === e.key ||
          specialCharMap[e.code] === shortcut.key
      } else if (e.shiftKey) {
        // check shift special character map
        const code = e.code.replace(/Key|Digit/, '')
        matchesKey = (shiftSpecialCharMap[code] || shiftSpecialCharMap[e.key]) &&
          (shiftSpecialCharMap[code] === shortcut.key || shiftSpecialCharMap[e.key] === shortcut.key)
      } else {
        matchesKey = shortcut.key.toUpperCase() === e.key.toUpperCase()
      }
      if (!matchesKey) return false

      let matchesModifier
      if (shortcut.modifier) {
        if (shortcut.modifier === shortcut.defaultModifier) matchesModifier = shortcut.os === 'windows' || shortcut.os === 'linux' ? e.ctrlKey : e.metaKey
        if (shortcut.modifier === 'meta') matchesModifier = e.metaKey
        if (shortcut.modifier === 'alt') matchesModifier = e.altKey
        if (shortcut.modifier === 'ctrl') matchesModifier = e.ctrlKey
      }
      return matchesModifier
    })

    if (shortcut) {
      e.preventDefault()
      shortcut.input.focus()
    }
  })

  // progressively enhance form elements that have the semanticForms class
  const forms = document.querySelectorAll('form.semanticForms:not(.semanticFormsActive), table.semanticForms:not(.semanticFormsActive)')

  for (const form of forms) {
    form.classList.add('semanticFormsActive')
    if (form.classList.contains('lowFlow')) continue

    // update each input in the semantic form
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
    for (let input of inputs) {
      // ignore input if it has previously been formatted
      if (input.classList.contains('semanticform') || !input.id) continue

      const type = input.getAttribute('type')
      if (nodeNameLookup.includes(input.nodeName) || inputTypeLookup.includes(type)) {
        // recursively find <dl> element
        let dl = input.parentNode
        while (dl && dl.nodeName !== 'DL') dl = dl.parentNode

        if (!dl) continue
        if (!dl.classList.contains('floatLabelForm')) dl.classList.add('floatLabelForm')

        const label = input.parentNode.parentNode.id && (type === 'checkbox' || type === 'radio')
          ? document.querySelector('label[data-for=' + input.parentNode.parentNode.id.replace(/\./g, '\\.') + ']')
          : document.querySelector('label[for=' + input.id.replace(/\./g, '\\.') + ']')

        if (!label) {
          console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) without a properly associated label. Make sure there is a label for it and the label has a matching "for" attribute.`)
        }

        input.classList.add('semanticform')

        // #region create labels

        const newLabel = document.createElement('label')
        newLabel.className = 'floatLabelFormAnimatedLabel'

        if (type === 'checkbox' || type === 'radio') {
          // recursively find <dd> element
          let dd = input.parentNode
          while (dd && dd.nodeName !== 'DD') dd = dd.parentNode

          if (!dd) {
            console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that is not inside a <dd> element.`)
            continue
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
              label.innerHTML += ` <span title="${text}" class="help">${helpTextIcon}</span>`
              newLabel.innerHTML += ` <span title="${text}" class="help">${helpTextIcon}</span>`
            }

            if (dd.querySelector(':required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span.required')) {
              const text = label.getAttribute('data-asterisk-text') || 'This field is required.'
              label.innerHTML += ` <span title="${text}" class="required">*</span>`
              newLabel.innerHTML += ` <span title="${text}" class="required">*</span>`
            }

            if (!dd.querySelector('label')) dd.append(newLabel)
          }

          // removes old div that a radio or checkbox may have been added to
          if (dd.parentElement.nodeName === 'DIV') dd.parentElement.remove()

          const div = document.createElement('div')
          div.append(label.closest('dt'), dd)
          dl.append(div)
        } else {
          newLabel.setAttribute('for', input.id)
          newLabel.innerHTML = label.innerHTML

          if (input.hasAttribute('title') && label.getAttribute('data-show-help-icon') !== null && !label.querySelector('span.help')) {
            const text = input.getAttribute('title')
            newLabel.innerHTML += ` <span title="${text}" class="help">${helpTextIcon}</span>`
          }

          if (input.hasAttribute('required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span.required')) {
            const text = label.getAttribute('data-asterisk-text') || 'This field is required.'
            newLabel.innerHTML += ` <span title="${text}" class="required">*</span>`
          }

          label.setAttribute('hidden', 'hidden')

          insertAfter(newLabel, input)
        }
        // #endregion

        // #region keyboard shortcuts
        if (input.getAttribute('data-focus-key') !== null) {
          function handleKeyboardShortcut () {
            const os = getOS()
            // this is the custom keyword for meta on linux/mac, ctrl on windows
            const defaultModifier = 'metactrl'

            // get focus key value
            let focusKey = input.getAttribute('data-focus-key')
            if (focusKey.length > 1) {
              console.error(`Provided focus key "${focusKey}" is more than one character. Using first character only.`)
              focusKey = focusKey.toString()[0]
            }

            // get focus modifier value
            let modifierSymbol
            let modifierKey = defaultModifier
            const modifierAttr = {
              default: input.getAttribute('data-focus-modifier') || defaultModifier,
              linux: input.getAttribute('data-focus-modifier-linux'),
              mac: input.getAttribute('data-focus-modifier-mac'),
              windows: input.getAttribute('data-focus-modifier-win')
            }
            if (os && modifierAttr[os]) {
              // a specific modifier key has been set by the user
              modifierKey = modifierAttr[os]
            } else {
              modifierKey = modifierAttr.default
            }

            // validate passed in modifier
            const recognizedModifiers = ['ctrl', 'alt', 'opt', 'meta', 'cmd', defaultModifier]
            if (!recognizedModifiers.includes(modifierKey)) {
              console.error(`Received an unrecognized modifier, "${modifierKey}," defaulting to "${defaultModifier}."`, input)
              modifierKey = defaultModifier
            }

            // retrieve modifier symbol
            if (['alt', 'opt'].includes(modifierKey)) {
              modifierSymbol = os === 'mac' ? '⌥' : '⎇'
            } else if (['meta', 'win', 'cmd'].includes(modifierKey) || (modifierKey === defaultModifier && os === 'mac')) {
              if (os === 'mac') {
                modifierSymbol = '⌘'
              } else if (os === 'linux') {
                modifierSymbol = '◆'
              } else {
                modifierSymbol = '⊞'
              }
            } else if (modifierKey === 'ctrl' || (modifierKey === defaultModifier && (os === 'windows' || os === 'linux'))) {
              if (os === 'mac') {
                modifierSymbol = '⌃'
              } else {
                modifierSymbol = 'Ctrl'
              }
            }

            // add the shortcut to the cached array, if not a duplicate
            if (keyboardShortcuts.some(shortcut => shortcut.key === focusKey && shortcut.modifier === modifierKey)) {
              console.error(`Duplicate keyboard shortcut "${modifierKey} + ${focusKey}" detected. Only the first input will be focusable using this keyboard shortcut.`, input)
            } else {
              keyboardShortcuts.push({
                key: focusKey,
                modifier: modifierKey,
                input,
                os,
                defaultModifier
              })
            }

            // set the shortcut indicator/title
            if (input.nodeName === 'TEXTAREA' || input.type === 'text' || input.type === 'number') {
              // create focus indicator for valid inputs
              const indicator = document.createElement('span')
              indicator.classList.add('focus-key')
              indicator.innerHTML = `<kbd>${modifierSymbol} ${focusKey.toUpperCase()}</kbd>`
              insertAfter(indicator, newLabel)
            } else {
              // update the input title
              if (input.getAttribute('title')) {
                input.setAttribute('title', input.getAttribute('title') + ` (${modifierSymbol} + ${focusKey})`)
              } else {
                input.setAttribute('title', `Focus with ${modifierSymbol} + ${focusKey}`)
              }
            }
          }

          // placed in a function so that it may exit while still completing other semantic-form enhancements
          handleKeyboardShortcut()
        }
        // #endregion

        // #region standard inputs
        // check for auto-grow attribute on textareas
        if (input.getAttribute('data-auto-grow') !== null) {
          // progressively enhance inputs into textareas
          if (input.nodeName === 'INPUT' && input.type === 'text') {
            const newInput = document.createElement('textarea')
            newInput.id = input.id
            newInput.class = input.class
            newInput.innerText = input.value
            newInput.setAttribute('data-auto-grow', '')
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
        }

        if (type !== 'checkbox' && type !== 'radio') {
          if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', ' ')

          const div = document.createElement('div')
          const dt = label.closest('dt')
          const dd = input.closest('dd')

          if (!dt) {
            console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that does not have a corresponding <dt> element.`)
            continue
          }
          if (!dd) {
            console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that does not have a corresponding <dd> element.`)
            continue
          }

          // #region input clear button
          if (input.nodeName !== 'SELECT' && type !== 'range') {
            const clearBtn = document.createElement('button')
            clearBtn.type = 'button'
            clearBtn.title = input.getAttribute('data-clear-field-text') || 'Clear field'
            clearBtn.ariaLabel = input.getAttribute('data-clear-field-text') || 'Clear field'
            clearBtn.tabIndex = -1
            clearBtn.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M 1 1 L 15 15 M 1 15 L 15 1" fill="none" stroke-width="2" stroke="currentColor" />'
            clearBtn.classList.add('clear')
            clearBtn.id = `semanticFormsClearButton_${input.id}`
            clearBtn.addEventListener('click', () => {
              input.previousValue = input.value
              input.value = ''
              input.focus()
              lastClearFieldPressed = input.id

              // used for any other updates required by various inputs
              input.dispatchEvent(new Event('input', { bubbles: true }))
            })
            insertAfter(clearBtn, dd.querySelector('label'))
          }
          input.addEventListener('focus', event => {
            if (event.target.nodeName === 'INPUT') lastFocusedInput = event.target
          })
          // #endregion

          // check for colspan- utility class
          if (/colspan-/.test(dd.className)) {
            const match = dd.className.match(/colspan-([0-9]|full)/)[0]
            dd.classList.remove(match)
            div.classList.add(match)
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
                div.style.width = width + 'px'
              }
              adjustWidth()
              input.addEventListener('input', adjustWidth)
            }
          }

          div.append(dt, dd)
          dl.append(div)

          // determine visibility of newly created <div>
          if (dt.style.display === 'none' && dd.style.display === 'none') div.style.display = 'none'
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

        // handle range inputs with a class to display the value
        if (type === 'range' && input.classList.contains('displayValue')) {
          const label = input.parentNode.parentNode.querySelector('dd label')
          label.innerHTML += `<span class="seperator">: </span><output>${input.value}</output>`
          input.addEventListener('input', event => {
            const output = event.target.parentNode.parentNode.querySelector('output')
            output.innerHTML = event.target.value
          })
        }

        // #region show password button
        if (type === 'password' && input.getAttribute('data-no-reveal') === null) {
          const showBtn = document.createElement('button')
          showBtn.type = 'button'
          showBtn.title = input.getAttribute('data-show-password-text') || 'Show password'
          showBtn.ariaLabel = input.getAttribute('data-show-password-text') || 'Show password'
          showBtn.tabIndex = -1
          showBtn.innerHTML = passwordShow
          showBtn.classList.add('show')
          showBtn.id = `semanticFormsShowButton_${input.id}`
          const dd = input.closest('dd')
          if (!dd) {
            console.error(`semantic-forms: Found an input (${input.id || input.getAttribute('name')}) that is not inside a <dd> element.`)
            continue
          }
          showBtn.addEventListener('click', () => {
            if (input.type === 'password') {
              showBtn.innerHTML = passwordHide
              showBtn.title = input.getAttribute('data-hide-password-text') || 'Hide password'
              showBtn.ariaLabel = input.getAttribute('data-hide-password-text') || 'Hide password'
              input.type = 'text'
            } else {
              showBtn.innerHTML = passwordShow
              showBtn.title = input.getAttribute('data-show-password-text') || 'Show password'
              showBtn.ariaLabel = input.getAttribute('data-show-password-text') || 'Show password'
              input.type = 'password'
            }
            input.focus()
          })
          insertAfter(showBtn, dd.querySelector('label'))
        }
        // #endregion

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

            // trigger the event to set the initial rows value
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }

          // progressively enhance textarea for Firefox and Safari
          // this may be removed once fully supported in Firefox and Safari: https://caniuse.com/wf-field-sizing
          if (input.getAttribute('data-auto-grow') !== null) {
            const adjustHeight = () => {
              if (input.value.length) {
                input.style.height = input.scrollHeight + 'px'
              } else {
                input.style.height = window.getComputedStyle(form).getPropertyValue('--semanticFormsInputHeight')
              }
            }

            // set initial height to semantic-forms CSS variable
            input.style.height = window.getComputedStyle(form).getPropertyValue('--semanticFormsInputHeight')
            input.addEventListener('input', adjustHeight)
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
    }
  }

  /**
   * Places an element immediately after another element
   * @param {Object} newNode element being placed after the reference node
   * @param {*} referenceNode element to be used as reference for new node
   */
  function insertAfter (newNode, referenceNode) {
    if (referenceNode.nextSibling) referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
    else referenceNode.parentNode.appendChild(newNode)
  }

  /**
   * Uses the navigator to best determine the clients operating system.
   * @returns Operating system string (`mac`, `windows`, `linux`)
   */
  function getOS () {
    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform
    let os = null

    if (platform.includes('Win')) {
      os = 'windows'
    } else if (platform.includes('Mac') || /iPhone|iPad|iPod/.test(userAgent)) {
      os = 'mac'
    } else if (platform.includes('Linux') || /Android/.test(userAgent)) {
      os = 'linux'
    }
    return os
  }

  // handle undo/redo
  let lastFocusedInput
  let lastClearFieldPressed
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      // undo clearing a field
      if (lastFocusedInput) {
        if (lastFocusedInput?.parentNode?.querySelector('button.clear').id === `semanticFormsClearButton_${lastClearFieldPressed}` || lastFocusedInput?.parentNode?.querySelector('button.clear').name === `semanticFormsClearButton_${lastClearFieldPressed}`) {
          if (lastFocusedInput.previousValue) {
            lastFocusedInput.redoValue = lastFocusedInput.value
            lastFocusedInput.value = lastFocusedInput.previousValue
          }
        }
      }
    } else if ((event.ctrlKey && event.key === 'y') || (event.metaKey && event.shiftKey && event.key === 'z')) {
      // redo clearing a field
      if (lastFocusedInput) {
        if (lastFocusedInput?.parentNode?.querySelector('button.clear').id === `semanticFormsClearButton_${lastClearFieldPressed}` || lastFocusedInput?.parentNode?.querySelector('button.clear').name === `semanticFormsClearButton_${lastClearFieldPressed}`) {
          if (lastFocusedInput.redoValue) {
            lastFocusedInput.previousValue = lastFocusedInput.value
            lastFocusedInput.value = lastFocusedInput.redoValue
          }
        }
      }
    }
  })

  // monitor changes to the DOM and enhance new semanticForms forms that get added
  if (!window.semanticFormsObserver) {
    window.semanticFormsObserver = new window.MutationObserver(mutations => {
      let stop = false
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'FORM' || node?.querySelector?.('form')) {
            semanticForms()
            stop = true
          }
        }
        if (stop) break
      }
    })
    window.semanticFormsObserver.observe(document.body, { attributes: false, childList: true, characterData: false, subtree: true })
  }

  semanticForms.reinitialize = form => {
    form.classList.remove('semanticFormsActive')
    semanticForms()
  }
}

module.exports = semanticForms
