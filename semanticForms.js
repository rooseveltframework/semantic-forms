window.semanticForms = () => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) return

  // progressively enhance form elements that have the semanticForms class
  const forms = document.querySelectorAll('form.semanticForms:not(.semanticFormsActive)')
  for (const form of forms) {
    form.classList.add('semanticFormsActive')
    if (!form.classList.contains('lowFlow')) {
      const clearfieldHorizontalOffset = parseInt(form.getAttribute('data-clearfield-horizontal-offset')) || 21
      const clearfieldVerticalOffset = parseInt(form.getAttribute('data-clearfield-vertical-offset')) || 5
      const inputs = Array.prototype.slice.call(form.getElementsByTagName('input')).concat(Array.prototype.slice.call(form.getElementsByTagName('textarea'))).concat(Array.prototype.slice.call(form.getElementsByTagName('select')))
      for (const input of inputs) {
        if (input.id) {
          const nodeName = input.nodeName
          const type = input.getAttribute('type')
          if (nodeName === 'TEXTAREA' || nodeName === 'SELECT' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'image' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
            let dl = input.parentNode
            while (dl && dl.nodeName !== 'DL') dl = dl.parentNode
            if (dl) {
              if (!dl.classList.contains('floatLabelForm')) dl.classList.add('floatLabelForm')
              let label
              if (input.parentNode.parentNode.id && (type === 'checkbox' || type === 'radio')) label = document.querySelector('label[data-for=' + input.parentNode.parentNode.id.replace(/\./g, '\\.') + ']')
              else label = document.querySelector('label[for=' + input.id.replace(/\./g, '\\.') + ']')
              if (type === 'checkbox' || type === 'radio') {
                dl = input.parentNode
                while (dl && dl.nodeName !== 'DD') dl = dl.parentNode
                if (dl.firstChild.nodeName !== 'LABEL') {
                  const newLabel = document.createElement('label')
                  newLabel.className = 'floatLabelFormAnimatedLabel'
                  if (type === 'checkbox' && input.parentNode.nodeName === 'DD') {
                    newLabel.setAttribute('for', input.id)
                    input.parentNode.classList.add('singleCheckbox')
                    newLabel.className = ''
                  }
                  newLabel.innerHTML = label.innerHTML
                  dl.insertBefore(newLabel, dl.firstChild)
                }
              } else {
                const newLabel = document.createElement('label')
                newLabel.setAttribute('for', input.id)
                newLabel.className = 'floatLabelFormAnimatedLabel'
                newLabel.innerHTML = label.innerHTML
                insertAfter(newLabel, input)
                label.setAttribute('hidden', 'hidden')
              }
              if (nodeName !== 'SELECT' && type !== 'checkbox' && type !== 'radio') {
                // if it doesn't have a placeholder, add a blank one
                if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', ' ')
                input.classList.add('semanticform')
                inputHandler(input) // force x to appear on inputs with prefilled value
              }
              input.addEventListener('input', inputHandler)
              input.addEventListener('mousemove', event => {
                const el = event.target
                const nodeName = el.nodeName
                const type = el.getAttribute('type')
                if (nodeName === 'TEXTAREA' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
                  inputHandler(event)
                  if (el.offsetWidth - clearfieldHorizontalOffset < event.clientX - el.getBoundingClientRect().left && clearfieldHorizontalOffset + clearfieldVerticalOffset > event.clientY - el.getBoundingClientRect().top
                  ) {
                    if (!el.classList.contains('onX')) {
                      el.classList.add('onX')
                    }
                  } else {
                    el.classList.remove('onX')
                  }
                }
              })
              input.addEventListener('click', event => {
                const el = event.target
                const nodeName = el.nodeName
                const type = el.getAttribute('type')
                if (nodeName === 'TEXTAREA' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
                  if (el.offsetWidth - clearfieldHorizontalOffset < event.clientX - el.getBoundingClientRect().left &&
                  clearfieldHorizontalOffset + clearfieldVerticalOffset > event.clientY - el.getBoundingClientRect().top
                  ) {
                    el.value = ''
                    el.dispatchEvent(new Event('input'))
                    el.form.dispatchEvent(new Event('input'))
                    el.classList.remove('x')
                    el.classList.remove('onX')
                  }
                }
              })
            }
          }
        }
      }
    }
  }

  // handle keystrokes or other input
  function inputHandler (event) {
    const el = event.target || event
    const nodeName = el.nodeName
    const type = el.getAttribute('type') || nodeName === 'TEXTAREA'
    if ((nodeName && type) && (nodeName === 'TEXTAREA' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week')) {
      if (el.value) {
        if (!el.classList.contains('x')) {
          el.classList.add('x')
        }
      } else {
        el.classList.remove('x')
      }
    }
  }

  // utility method for inserting an element after another element
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
