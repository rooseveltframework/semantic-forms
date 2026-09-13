// uses the navigator to best determine the client's operating system
//
// returns one of `mac`, `windows`, or `linux`
const getOS = () => {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  let os = null

  if (platform.includes('Win')) {
    os = 'windows'
  } else if (platform.includes('Mac') || /iPhone|iPad|iPod/.test(userAgent)) {
    os = 'mac'
  } else if (platform.includes('Linux') || /Android/.test(userAgent)) {
    os = 'linux'
  }
  return os
}

// places an element immediately after another element
//
// newNode: the element being placed after the reference node
// referenceNode: the element the new node is placed after
const insertAfter = (newNode, referenceNode) => {
  if (referenceNode.nextSibling) referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
  else referenceNode.parentNode.appendChild(newNode)
}

// works out how far a font's visible text sits from the middle of its own line box
//
// browsers place a line of text by the font's ascent and descent, which are rarely symmetrical, so the letters themselves end up slightly above or below the middle of the box holding them. that is invisible at the half pixel it usually amounts to, until a display without a high pixel density rounds it up to a whole one. the shift is the same for every element using the font, so it is measured once per font and reused
//
// returns the number of pixels the text sits below the middle of its box, negative when it sits above
const inkOffsets = new Map()
const getInkOffset = (fontStyle, fontWeight, fontSize, fontFamily) => {
  const key = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
  if (inkOffsets.has(key)) return inkOffsets.get(key)

  // the ascent is where the baseline falls in a line box, which an inline-block aligned to the baseline reports directly
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden;line-height:normal;padding:0;border:0;margin:0;font-style:${fontStyle};font-weight:${fontWeight};font-size:${fontSize};font-family:${fontFamily}`
  const marker = document.createElement('span')
  marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
  probe.append('Hxn', marker)
  document.body.append(probe)
  const lineBox = probe.getBoundingClientRect()
  const ascent = marker.getBoundingClientRect().top - lineBox.top
  const descent = lineBox.height - ascent
  probe.remove()

  // the cap height is where the letters actually start, which only the drawn pixels can say. drawing it large keeps the answer accurate to a fraction of a pixel
  const scale = 8
  const size = parseFloat(fontSize)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(size * scale * 4)
  canvas.height = Math.ceil(size * scale * 3)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#000'
  context.font = `${fontStyle} ${fontWeight} ${size * scale}px ${fontFamily}`
  context.textBaseline = 'alphabetic'
  const baseline = Math.round(size * scale * 2)
  context.fillText('Hxn', 10, baseline)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let inkTop = null
  for (let y = 0; y < canvas.height && inkTop === null; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4] < 128) {
        inkTop = y
        break
      }
    }
  }
  if (inkTop === null) {
    const none = { offset: 0, fieldOffset: 0 }
    inkOffsets.set(key, none)
    return none
  }
  const capHeight = (baseline - inkTop) / scale

  // rounded to whole device pixels, because browsers put a line of text on the pixel grid rather than at the fraction of one asked for. a correction finer than that either does nothing or moves the letters a whole pixel, depending on which side of the halfway mark the sum lands
  //
  // two roundings come out of this, because a measurement landing exactly halfway can go either way and the browser does not send every kind of text the same way. our own labels follow the ordinary rounding; the text a field draws inside itself, and the text on a button, follow the one that rounds a half away from zero. they differ only for a measurement of exactly minus a half, and agree everywhere else
  const ratio = window.devicePixelRatio || 1
  const exact = ((ascent - descent) / 2 - capHeight / 2) * ratio
  const offset = Math.round(exact) / ratio
  const fieldOffset = Math.sign(exact) * Math.round(Math.abs(exact)) / ratio
  const pair = { offset, fieldOffset }
  inkOffsets.set(key, pair)
  return pair
}

// puts the measured offset on the form as a custom property, for the stylesheet to subtract when it centers the float label on its field
const applyInkOffset = (form, label) => {
  if (!label.isConnected) return
  const style = window.getComputedStyle(label)
  const { offset, fieldOffset } = getInkOffset(style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily)
  form.style.setProperty('--semanticFormsTextInkOffset', `${offset}px`)
  form.style.setProperty('--semanticFormsFieldTextInkOffset', `${fieldOffset}px`)
}

// a web font that is still downloading when a form is enhanced is measured in whichever font the page falls back to, and the letters move once the real one arrives. the forms measured so far are remembered so they can be measured again at that point, which the browser reports once for the page rather than once per font
const measured = new Map()
let awaitingFonts = false
const setInkOffset = (form, label) => {
  measured.set(form, label)
  applyInkOffset(form, label)

  if (awaitingFonts || !document.fonts) return
  awaitingFonts = true
  document.fonts.ready.then(() => {
    // the cache is keyed by what the font is called, which does not change when the file behind it finally loads
    inkOffsets.clear()
    for (const [form, label] of measured) applyInkOffset(form, label)
    measured.clear()
  })
}

module.exports = { getOS, insertAfter, setInkOffset }
