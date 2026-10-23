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

// the demo shows every widget twice over, once enhanced by javascript and once with the lowFlow class that switches those enhancements off. this toggle picks which of the two is on screen
const flowToggle = document.querySelector('#low_flow_view')
if (flowToggle) {
  const showLowFlow = () => {
    document.body.classList.toggle('lowFlowView', flowToggle.checked)

    // the two copies of each section have different ids, so the contents links have to follow whichever one is being shown. they start out pointing at the unenhanced sections, which are the ones a visitor without javascript sees
    for (const link of document.querySelectorAll('[data-section]')) {
      link.href = `#${flowToggle.checked ? 'low-flow-' : ''}${link.dataset.section}`
    }
  }

  flowToggle.addEventListener('change', showLowFlow)
  showLowFlow()
}
