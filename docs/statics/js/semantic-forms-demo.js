// prevent forms from going anywhere
const forms = document.querySelectorAll('form')
for (const form of forms) form.addEventListener('submit', e => e.preventDefault())

// enable green button easter egg
const greenButtons = document.querySelectorAll('input[type="image"]')
for (const button of greenButtons) {
  button.addEventListener('click', (e) => {
    e.preventDefault()
    window.alert('GREEN!!!')
  })
}
