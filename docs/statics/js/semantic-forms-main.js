// this will stop the JS from executing if CSS is disabled or a CSS file fails to load; it will also remove any existing CSS from the DOM
require('check-if-css-is-disabled')()
window.addEventListener('cssDisabled', (event) => {
  // undo any DOM manipulations and then stop any further JS from executing
  document.body.classList.replace('js', 'no-js')
  throw new Error('A CSS file failed to load at some point during the app\'s usage. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
})

// replace no-js class with js class which allows us to write css that targets non-js or js enabled users separately
document.body.classList.replace('no-js', 'js')

// load semantic-forms library
require('semantic-forms')()

// dark mode / light mode
function toggleDarkMode (mode) {
  document.body.classList.remove('light', 'dark') 

  if (mode === 'light' || document.querySelector('html').className === 'dark') {
    document.body.classList.toggle('light', true) 
    document.querySelector('html').className = 'light'
    document.querySelector('link[href="/css/highlight.js.dark.css"]')?.remove()
    document.querySelector('link[href="/css/highlight.js.light.css"]')?.remove()
    document.querySelector('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/css/highlight.js.light.css">')
    document.querySelector('#mode button').innerHTML = 'Switch to dark mode'
    const forms = document.querySelectorAll('form')
    for (const form of forms) {
      form.classList.add('light')
      form.classList.remove('dark')
    }
  } else {
    document.body.classList.toggle('dark', true) 
    document.querySelector('html').className = 'dark'
    document.querySelector('link[href="/css/highlight.js.dark.css"]')?.remove()
    document.querySelector('link[href="/css/highlight.js.light.css"]')?.remove()
    document.querySelector('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/css/highlight.js.dark.css">')
    document.querySelector('#mode button').innerHTML = 'Switch to light mode'
    const forms = document.querySelectorAll('form')
    for (const form of forms) {
      form.classList.add('dark')
      form.classList.remove('light')
    }
  }
}
document.body.insertAdjacentHTML('afterbegin', '<form id="mode" class="semanticForms"><button></button></form>')
document.querySelector('#mode button').addEventListener('click', (event) => toggleDarkMode())
if (window.matchMedia('(prefers-color-scheme: dark)').matches) toggleDarkMode('dark')
else toggleDarkMode('light')

// syntax highlighting
const hljs = require('highlight.js')
hljs.highlightAll()

// load semantic-forms demo code
require('semantic-forms-demo')
