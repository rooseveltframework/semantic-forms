const { createKeyboardShortcut, shortcutListener } = require('./lib/keyboardShortcuts.js')
const { enhanceInput, handleUndoRedo } = require('./lib/inputEnhancements.js')
const { enhanceTabs } = require('./lib/tabs.js')
const { setInkOffset } = require('./lib/helpers.js')

// one observer per tree that has been handed to semanticForms, so that a shadow root gets its own without replacing the document's
const observers = new WeakMap()

// progressively enhances every semanticForms form in a tree
//
// root: document or shadow root to search; defaults to the main document
const semanticForms = (root = document) => {
  // do some feature detection so none of the JS executes if the browser is too old
  if (typeof document.getElementsByClassName !== 'function' || typeof document.querySelector !== 'function' || !document.body.classList || !window.MutationObserver) {
    console.warn('semantic-forms was loaded into an unsupported browser and will not execute.')
    return
  }

  // custom keyboard shortcut listener
  const keyboardShortcuts = []
  document.addEventListener('keydown', (e) => shortcutListener(e, keyboardShortcuts))

  // progressively enhance form elements that have the semanticForms class
  const forms = root.querySelectorAll('form.semanticForms:not(.semanticFormsActive), table.semanticForms:not(.semanticFormsActive)')

  for (const form of forms) {
    form.classList.add('semanticFormsActive')
    if (form.classList.contains('lowFlow')) continue

    // how far this font's letters sit from the middle of their own line box, which the stylesheet subtracts wherever it centers text. it is measured per form rather than per field, so that a form holding nothing but buttons is corrected too
    setInkOffset(form, form)

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

    // done after the inputs so that anything sizing itself measures while it is still on screen
    enhanceTabs(form)
  }

  // prevents multiple listeners
  document.removeEventListener('keydown', handleUndoRedo)
  document.addEventListener('keydown', handleUndoRedo)

  // monitor changes to this tree and enhance new semanticForms forms that get added to it
  if (!observers.has(root)) {
    const observer = new window.MutationObserver(mutations => {
      let stop = false
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'FORM' || node?.querySelector?.('form')) {
            semanticForms(root)
            stop = true
          }
        }
        if (stop) break
      }
    })

    // a shadow root is observed directly; the document is observed through its body
    observer.observe(root === document ? document.body : root, { attributes: false, childList: true, characterData: false, subtree: true })
    observers.set(root, observer)

    // long standing name for the document's observer, kept for anything already using it
    if (root === document) window.semanticFormsObserver = observer
  }

  semanticForms.reinitialize = form => {
    // with no form given this just rescans for forms that are not active yet
    if (!form) return semanticForms(root)

    form.classList.remove('semanticFormsActive')

    // the form knows which tree it belongs to, so a form in a shadow root reinitializes there
    semanticForms(form.getRootNode())
  }
}

module.exports = semanticForms
