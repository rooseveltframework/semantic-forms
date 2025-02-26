module.exports = () => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) return

  const passwordShow = '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m1 12s4-8 11-8 11 8 11 8"/><path d="m1 12s4 8 11 8 11-8 11-8"/><circle cx="12" cy="12" r="3"/></g></svg>'
  const passwordHide = '<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 2 20 20"/><path d="m6.71277 6.7226c-3.04798 2.07267-4.71277 5.2774-4.71277 5.2774s3.63636 7 10 7c2.0503 0 3.8174-.7266 5.2711-1.7116m-6.2711-12.23018c.3254-.03809.6588-.05822 1-.05822 6.3636 0 10 7 10 7s-.6918 1.3317-2 2.8335"/><path d="m14 14.2362c-.5308.475-1.2316.7639-2 .7639-1.6569 0-3-1.3431-3-3 0-.8237.33193-1.5698.86932-2.11192"/></g></svg>'

  const nodeNameLookup = ['TEXTAREA', 'SELECT']
  const inputTypeLookup = ['checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'image', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']

  // progressively enhance form elements that have the semanticForms class
  const forms = document.querySelectorAll('form.semanticForms:not(.semanticFormsActive)')

  for (const form of forms) {
    form.classList.add('semanticFormsActive')
    if (form.classList.contains('lowFlow')) continue

    // update each input in the semantic form
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
    for (const input of inputs) {
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

        input.classList.add('semanticform')

        // #region create labels
        if (type === 'checkbox' || type === 'radio') {
          // recursively find <dd> element
          let dd = input.parentNode
          while (dd && dd.nodeName !== 'DD') dd = dd.parentNode

          if (dd.firstChild.nodeName !== 'LABEL') {
            const newLabel = document.createElement('label')
            newLabel.className = 'floatLabelFormAnimatedLabel'

            if (type === 'checkbox' && input.parentNode.nodeName === 'DD') {
              newLabel.setAttribute('for', input.id)
              input.parentNode.classList.add('singleCheckbox')
              newLabel.className = ''
              label.setAttribute('hidden', 'hidden')
              insertAfter(newLabel, input)
            }

            newLabel.innerHTML = label.innerHTML

            if (dd.querySelector(':required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span')) {
              const text = label.getAttribute('data-asterisk-text') || 'This field is required.'
              label.innerHTML += `<span title="${text}">*</span>`
            }

            if (!dd.querySelector('label')) dd.append(newLabel)
          }

          // removes old div that a radio or checkbox may have been added to
          if (dd.parentElement.nodeName === 'DIV') dd.parentElement.remove()

          const div = document.createElement('div')
          div.append(label.closest('dt'), dd)
          dl.append(div)
        } else {
          const newLabel = document.createElement('label')
          newLabel.setAttribute('for', input.id)
          newLabel.className = 'floatLabelFormAnimatedLabel'

          newLabel.innerHTML = label.innerHTML

          if (input.hasAttribute('required') && label.getAttribute('data-no-asterisk') === null && !label.querySelector('span')) {
            const text = label.getAttribute('data-asterisk-text') || 'This field is required.'
            newLabel.innerHTML += ` <span title="${text}">*</span>`
          }

          label.setAttribute('hidden', 'hidden')

          insertAfter(newLabel, input)
        }
        // #endregion

        // standard inputs
        if (type !== 'checkbox' && type !== 'radio') {
          if (!input.getAttribute('placeholder')) {
            input.setAttribute('placeholder', ' ')
          }

          const div = document.createElement('div')
          const dt = label.closest('dt')
          const dd = input.closest('dd')

          // #region clear button
          if (input.nodeName !== 'SELECT' && type !== 'range') {
            const clearBtn = document.createElement('button')
            clearBtn.type = 'button'
            clearBtn.title = input.getAttribute('data-clear-field-text') || 'Clear field'
            clearBtn.ariaLabel = input.getAttribute('data-clear-field-text') || 'Clear field'
            clearBtn.tabIndex = -1
            clearBtn.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M 1 1 L 15 15 M 1 15 L 15 1" fill="none" stroke-width="2" stroke="currentColor" />'
            clearBtn.classList.add('clear')
            clearBtn.id = `semanticFormsClearButton_${input.id}`
            clearBtn.addEventListener('click', (event) => {
              input.previousValue = input.value
              input.value = ''
              input.focus()
              lastClearFieldPressed = input.id
            })
            insertAfter(clearBtn, dd.querySelector('label'))
          }
          input.addEventListener('focus', (event) => {
            if (event.target.nodeName === 'INPUT') lastFocusedInput = event.target
          })
          // #endregion

          // check for colspan- utility class
          if (/colspan-/.test(dd.className)) {
            const match = dd.className.match(/colspan-([0-9]|full)/)[0]
            dd.classList.remove(match)
            div.classList.add(match)
          }

          div.append(dt, dd)
          dl.append(div)

          // determine visibility of newly created <div>
          if (dt.style.display === 'none' && dd.style.display === 'none') div.style.display = 'none'
        }

        // handle file input clear btn, cannot be handled with CSS
        if (type === 'file') {
          const clearBtn = input.parentElement.querySelector('.clear')
          input.addEventListener('input', e => {
            clearBtn.style.display = e.target.files.length ? 'flex' : 'none'
          })
          clearBtn.addEventListener('click', () => {
            clearBtn.style.display = 'none'
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
          showBtn.addEventListener('click', (event) => {
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
        for (const textarea of document.querySelectorAll('textarea')) {
          // shifts the close button to the right if a scrollbar is present
          const shiftCloseBtn = () => {
            const clearBtn = textarea.parentElement?.querySelector('button.clear')
            if (clearBtn) {
              clearBtn.style.marginRight = textarea.clientHeight < textarea.scrollHeight ? '15px' : ''
            }
          }

          textarea.addEventListener('input', shiftCloseBtn)
          textarea.addEventListener('mouseup', shiftCloseBtn)
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

  // handle undo/redo
  let lastFocusedInput
  let lastClearFieldPressed
  document.addEventListener('keydown', (event) => {
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
    window.semanticFormsObserver = new window.MutationObserver((mutations) => {
      let stop = false
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'FORM') {
            window.semanticForms()
            stop = true
          }
        }
        if (stop) break
      }
    })
    window.semanticFormsObserver.observe(document.body, { attributes: false, childList: true, characterData: false, subtree: true })
  }

  window.semanticForms.reinitialize = (form) => {
    form.classList.remove('semanticFormsActive')
    window.semanticForms()
  }
}
