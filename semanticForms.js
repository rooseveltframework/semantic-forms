const { shortcutListener, createKeyboardShortcut } = require('./lib/keyboardShortcuts.js')
const { enhanceInput } = require('./lib/inputEnhancements.js')

const semanticForms = () => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) {
    console.warn('semantic-forms was loaded into an unsupported browser and will not execute.')
    return
  }

  // custom keyboard shortcut listener
  const keyboardShortcuts = []
  document.addEventListener('keydown', (e) => shortcutListener(e, keyboardShortcuts))

  // progressively enhance form elements that have the semanticForms class
  const forms = document.querySelectorAll('form.semanticForms:not(.semanticFormsActive), table.semanticForms:not(.semanticFormsActive)')

  for (const form of forms) {
    form.classList.add('semanticFormsActive')
    if (form.classList.contains('lowFlow')) continue

    // update each input in the semantic form
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
    for (const input of inputs) {
      enhanceInput(input, form)

      // handle keyboard shortcuts
      if (input.getAttribute('data-focus-key') !== null) {
        const shortcut = createKeyboardShortcut(input, keyboardShortcuts)
        keyboardShortcuts.push(shortcut)
      }
    }
  }

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
