(function (global) {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList) {
    return
  }

  var forms = document.querySelectorAll('form.semanticForms')
  var fl = forms.length
  var f
  var form
  var inputs
  var input
  var nodeName
  var type
  var label
  var newLabel
  var dl
  var l
  var clearfieldHorizontalOffset
  var clearfieldVerticalOffset
  var i

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
          if (nodeName === 'TEXTAREA' || nodeName === 'SELECT' || type === 'text' || type === 'password' || type === 'email' || type === 'date' || type === 'checkbox' || type === 'radio') {
            dl = input.parentNode
            while (dl && dl.nodeName !== 'DL') {
              dl = dl.parentNode
            }
            if (!dl.classList.contains('floatLabelForm')) {
              dl.classList.add('floatLabelForm')
            }
            if (type === 'checkbox' || type === 'radio') {
              label = document.querySelector('label[data-for=' + input.parentNode.parentNode.id + ']')
            } else {
              label = document.querySelector('label[for=' + input.id + ']')
            }
            label = label.innerHTML
            if (type === 'checkbox' || type === 'radio') {
              dl = input.parentNode
              while (dl && dl.nodeName !== 'DD') {
                dl = dl.parentNode
              }
              if (dl.firstChild.nodeName !== 'LABEL') {
                newLabel = document.createElement('label')
                newLabel.className = 'floatLabelFormAnimatedLabel'
                newLabel.innerHTML = label
                dl.insertBefore(newLabel, dl.firstChild)
              }
            } else {
              newLabel = document.createElement('label')
              newLabel.setAttribute('for', input.id)
              newLabel.className = 'floatLabelFormAnimatedLabel'
              newLabel.innerHTML = label
              insertAfter(newLabel, input)
            }

            if (nodeName !== 'SELECT' && type !== 'checkbox' && type !== 'radio' && type !== 'date') {
              // if it doesn't have a placeholder, add a blank one
              if (!input.getAttribute('placeholder')) {
                input.setAttribute('placeholder', '')
              }
              input.addEventListener('input', inputHandler)
              input.addEventListener('mousemove', function (e) {
                inputHandler(e)
                var el = e.target
                if (this.offsetWidth - clearfieldHorizontalOffset < e.clientX - this.getBoundingClientRect().left && clearfieldHorizontalOffset + clearfieldVerticalOffset > e.clientY - this.getBoundingClientRect().top
                ) {
                  if (!el.classList.contains('onX')) {
                    el.classList.add('onX')
                  }
                } else {
                  el.classList.remove('onX')
                }
              })
              input.addEventListener('click', function (e) {
                var el = e.target
                if (this.offsetWidth - clearfieldHorizontalOffset < e.clientX - this.getBoundingClientRect().left &&
                clearfieldHorizontalOffset + clearfieldVerticalOffset > e.clientY - this.getBoundingClientRect().top
                ) {
                  el.value = ''
                  el.classList.remove('x')
                  el.classList.remove('onX')
                }
              })
              inputHandler(input) // force x to appear on inputs with prefilled value
            }
          }
        }
      }
    }
  }

  function inputHandler (e) {
    var el = e.target || e
    if (el.value) {
      if (!el.classList.contains('x')) {
        el.classList.add('x')
      }
    } else {
      el.classList.remove('x')
    }
  }

  function insertAfter (newNode, referenceNode) {
    if (referenceNode.nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
    } else {
      referenceNode.parentNode.appendChild(newNode)
    }
  }
})(this)
