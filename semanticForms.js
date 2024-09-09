window.semanticForms = () => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) return

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
            }

            newLabel.innerHTML = label.innerHTML
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
            clearBtn.ariaLabel = 'Clear input'
            clearBtn.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18"><path d="M 1 1 L 15 15 M 1 15 L 15 1" fill="none" stroke-width="2" stroke="currentColor" />'
            clearBtn.classList.add('clear')
            clearBtn.addEventListener('click', () => {
              input.value = ''
              input.focus()
            })
            insertAfter(clearBtn, dd.querySelector('label'))
          }
          // #endregion

          // check for col- utility class
          if (/col-/.test(dd.className)) {
            const match = dd.className.match(/col-([0-9]|full)/)[0]
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
}

window.semanticForms.reinitialize = (form) => {
  form.classList.remove('semanticFormsActive')
  window.semanticForms()
}
