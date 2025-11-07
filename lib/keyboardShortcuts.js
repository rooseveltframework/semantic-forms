const { getOS, insertAfter } = require('./helpers.js')

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

// handles keyboard shortcut events
const shortcutListener = (e, shortcuts) => {
  // search for matching shortcut from cached shortcut configs
  const shortcut = shortcuts.find(shortcut => {
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
}

const createKeyboardShortcut = (input, shortcuts) => {
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
  if (shortcuts.some(shortcut => shortcut.key === focusKey && shortcut.modifier === modifierKey)) {
    console.error(`Duplicate keyboard shortcut "${modifierKey} + ${focusKey}" detected. Only the first input will be focusable using this keyboard shortcut.`, input)
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

  return {
    key: focusKey,
    modifier: modifierKey,
    input,
    os,
    defaultModifier
  }
}

module.exports = {
  shortcutListener,
  createKeyboardShortcut
}
