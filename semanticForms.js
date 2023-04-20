(function () {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList) {
    return
  }

  const forms = document.querySelectorAll('form.semanticForms')
  const fl = forms.length
  let f
  let form
  let inputs
  let input
  let nodeName
  let type
  let label
  let labelHTML
  let newLabel
  let dl
  let l
  let clearfieldHorizontalOffset
  let clearfieldVerticalOffset
  let i

  // don't execute any of the JS if no forms class semanticForms exist
  if (fl <= 0) {
    return
  }

  for (f = 0; f < fl; f++) {
    form = forms[f]
    if (!form.classList.contains('lowFlow')) {
      clearfieldHorizontalOffset = parseInt(form.getAttribute('data-clearfield-horizontal-offset')) || 21
      clearfieldVerticalOffset = parseInt(form.getAttribute('data-clearfield-vertical-offset')) || 5
      inputs = Array.prototype.slice.call(form.getElementsByTagName('input')).concat(Array.prototype.slice.call(form.getElementsByTagName('textarea'))).concat(Array.prototype.slice.call(form.getElementsByTagName('select')))
      l = inputs.length

      for (i = 0; i < l; i++) {
        input = inputs[i]
        if (input && input.id) {
          nodeName = input.nodeName
          type = input.getAttribute('type')
          if (nodeName === 'TEXTAREA' || nodeName === 'SELECT' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'image' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
            dl = input.parentNode
            while (dl && dl.nodeName !== 'DL') {
              dl = dl.parentNode
            }
            if (dl) {
              if (!dl.classList.contains('floatLabelForm')) {
                dl.classList.add('floatLabelForm')
              }
              if (type === 'checkbox' || type === 'radio') {
                label = document.querySelector('label[data-for=' + input.parentNode.parentNode.id + ']')
              } else {
                label = document.querySelector('label[for=' + input.id + ']')
              }
              labelHTML = label.innerHTML
              if (type === 'checkbox' || type === 'radio') {
                dl = input.parentNode
                while (dl && dl.nodeName !== 'DD') {
                  dl = dl.parentNode
                }
                if (dl.firstChild.nodeName !== 'LABEL') {
                  newLabel = document.createElement('label')
                  newLabel.className = 'floatLabelFormAnimatedLabel'
                  newLabel.innerHTML = labelHTML
                  dl.insertBefore(newLabel, dl.firstChild)
                }
              } else {
                newLabel = document.createElement('label')
                newLabel.setAttribute('for', input.id)
                newLabel.className = 'floatLabelFormAnimatedLabel'
                newLabel.innerHTML = labelHTML
                insertAfter(newLabel, input)
                label.setAttribute('hidden', 'hidden')
              }

              if (nodeName !== 'SELECT' && type !== 'checkbox' && type !== 'radio') {
                // if it doesn't have a placeholder, add a blank one
                if (!input.getAttribute('placeholder')) {
                  input.setAttribute('placeholder', '')
                }
                input.classList.add('semanticform')
                inputHandler(input) // force x to appear on inputs with prefilled value
              }
            }
          }
        }
      }
    }
  }

  document.addEventListener('input', inputHandler)

  document.addEventListener('mousemove', function (e) {
    if (isPatternElement(e)) {
      const el = e.target
      const nodeName = el.nodeName
      const type = el.getAttribute('type')
      if (nodeName === 'TEXTAREA' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
        inputHandler(e)
        if (el.offsetWidth - clearfieldHorizontalOffset < e.clientX - el.getBoundingClientRect().left && clearfieldHorizontalOffset + clearfieldVerticalOffset > e.clientY - el.getBoundingClientRect().top
        ) {
          if (!el.classList.contains('onX')) {
            el.classList.add('onX')
          }
        } else {
          el.classList.remove('onX')
        }
      }
    }
  })

  document.addEventListener('click', function (e) {
    if (isPatternElement(e)) {
      const el = e.target
      const nodeName = el.nodeName
      const type = el.getAttribute('type')
      if (nodeName === 'TEXTAREA' || type === 'checkbox' || type === 'color' || type === 'date' || type === 'datetime-local' || type === 'email' || type === 'file' || type === 'month' || type === 'number' || type === 'password' || type === 'radio' || type === 'range' || type === 'search' || type === 'tel' || type === 'text' || type === 'time' || type === 'url' || type === 'week') {
        if (el.offsetWidth - clearfieldHorizontalOffset < e.clientX - el.getBoundingClientRect().left &&
        clearfieldHorizontalOffset + clearfieldVerticalOffset > e.clientY - el.getBoundingClientRect().top
        ) {
          el.value = ''
          el.classList.remove('x')
          el.classList.remove('onX')
        }
      }
    }
  })

  function inputHandler (e) {
    if (isPatternElement(e)) {
      const el = e.target || e
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
  }

  function insertAfter (newNode, referenceNode) {
    if (referenceNode.nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
    } else {
      referenceNode.parentNode.appendChild(newNode)
    }
  }

  function isPatternElement (e) {
    const thisEl = e.target || e
    if (!thisEl.classList || !thisEl.classList.contains('semanticform')) {
      return false
    }
    return true
  }
})(this)
