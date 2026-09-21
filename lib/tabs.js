let tabGroupCount = 0

// turns a group of fieldsets into a set of tabs
//
// the markup it enhances is an element with the `tabs` class holding one `<fieldset>` per tab, each titled by its `<legend>`. left alone that is a stack of labelled field groups, which is a perfectly usable form, so a browser without JavaScript still gets everything
//
// the tab that opens first is the one whose fieldset carries `data-selected`, or the first fieldset when none do
//
// form: form element to search for tab groups
const enhanceTabs = (form) => {
  for (const group of form.querySelectorAll('.tabs:not(.semanticFormsTabsActive)')) {
    const panels = Array.from(group.children).filter(child => child.nodeName === 'FIELDSET')

    // one fieldset is not a set of tabs, and no fieldsets means the class is on the wrong element
    if (panels.length < 2) {
      if (panels.length === 0) console.error('semantic-forms: Found a .tabs element with no <fieldset> children. Each tab needs to be a <fieldset> with a <legend> naming it.', group)
      continue
    }

    group.classList.add('semanticFormsTabsActive')
    const groupId = ++tabGroupCount
    const tabList = document.createElement('div')
    const tabs = []

    tabList.classList.add('tabList')
    tabList.setAttribute('role', 'tablist')

    // shows one panel and marks its tab as the selected one
    const selectTab = (index, moveFocus) => {
      for (const [i, panel] of panels.entries()) panel.hidden = i !== index
      for (const [i, tab] of tabs.entries()) {
        const selected = i === index
        tab.setAttribute('aria-selected', selected ? 'true' : 'false')

        // only the selected tab is in the tab order; the arrow keys reach the others
        tab.tabIndex = selected ? 0 : -1
      }
      if (moveFocus) tabs[index].focus()
    }

    for (const [index, panel] of panels.entries()) {
      const legend = panel.querySelector('legend')
      const tab = document.createElement('button')

      tab.type = 'button'
      tab.setAttribute('role', 'tab')
      tab.id = `semanticFormsTab_${groupId}_${index}`
      tab.textContent = legend ? legend.textContent : `Tab ${index + 1}`

      if (!panel.id) panel.id = `semanticFormsTabPanel_${groupId}_${index}`
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', tab.id)
      tab.setAttribute('aria-controls', panel.id)

      // the tab now names the panel, so the legend would be read out twice
      if (legend) legend.hidden = true

      tab.addEventListener('click', () => selectTab(index))
      tabs.push(tab)
      tabList.append(tab)
    }

    // the arrow keys move between tabs, which is what a tablist is expected to do
    tabList.addEventListener('keydown', event => {
      const current = tabs.indexOf(document.activeElement)
      if (current === -1) return

      const keys = {
        ArrowRight: (current + 1) % tabs.length,
        ArrowLeft: (current - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      }
      if (!(event.key in keys)) return

      event.preventDefault()
      selectTab(keys[event.key], true)
    })

    // the panel carrying [data-selected] is the one that opens, defaulting to the first. without javascript every panel is on the page at once, so the attribute only means anything once the tabs have been built
    const marked = panels.filter(panel => panel.hasAttribute('data-selected'))
    if (marked.length > 1) console.error('semantic-forms: Found more than one <fieldset> with a "data-selected" attribute in a tab group. Only the first one will be selected.', group)

    group.prepend(tabList)
    selectTab(marked.length ? panels.indexOf(marked[0]) : 0)
  }
}

module.exports = { enhanceTabs }
