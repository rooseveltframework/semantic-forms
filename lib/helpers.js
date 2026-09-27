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

// reads the offset for a form's font, which needs its computed style, and puts it on the form as custom properties, for the stylesheet to subtract when it centers the float label on its field
//
// these are separate so that a batch of forms can have every one read before any is written to. reading a style after writing one makes the browser lay the page out again to answer, so measuring and writing one form at a time laid out the whole page once per form
const readInkOffset = label => {
  if (!label.isConnected) return null
  const style = window.getComputedStyle(label)
  return getInkOffset(style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily)
}

const writeInkOffset = (form, pair) => {
  form.style.setProperty('--semanticFormsTextInkOffset', `${pair.offset}px`)
  form.style.setProperty('--semanticFormsFieldTextInkOffset', `${pair.fieldOffset}px`)
}

// measures a batch of forms: every read first, then every write
const measureAll = forms => {
  const read = []
  for (const [form, label] of forms) {
    const pair = readInkOffset(label)
    if (pair) read.push([form, pair])
  }
  for (const [form, pair] of read) writeInkOffset(form, pair)
}

// a web font that is still downloading when a form is measured is measured in whichever font the page falls back to, and the letters move once the real one arrives. the forms measured so far are remembered so they can be measured again at that point, which the browser reports once for the page rather than once per font
const measured = new Map()
let awaitingFonts = false
const measure = forms => {
  measureAll(forms)
  if (!document.fonts || (document.fonts.status === 'loaded' && awaitingFonts)) return // measured in the fonts the page ended up with, so there is nothing to measure again for
  for (const [form, label] of forms) measured.set(form, label)

  if (awaitingFonts) return
  awaitingFonts = true
  document.fonts.ready.then(() => {
    // the cache is keyed by what the font is called, which does not change when the file behind it finally loads
    inkOffsets.clear()
    measureAll(measured)
    measured.clear()
  })
}

// measures each form once the browser has laid the page out, and a form off screen once it comes near the screen, rather than as it is enhanced
//
// reading a form's style while the page is still loading makes the browser lay the whole page out on the spot to answer, before it would have done so anyway. on a page with many forms, that cost several times what laying the page out once does. it also defeated content-visibility: auto, which only skips what is off screen once the browser has worked out what is, so reading anything in there beforehand rendered all of it. an intersection observer reports only after the browser has laid the page out, so reading a form's style is cheap by then, and reports a form off screen only as it comes near, so what content-visibility skips stays skipped
//
// the margin is wider than the one the browser renders skipped content within, so a form is measured just before it is drawn rather than once it already has been. a form on screen from the start is measured just after the page is first drawn, which can move its labels by the pixel the measurement corrects for, the same as when a web font arrives
const waiting = new Map()
let observer
const setInkOffset = (form, label) => {
  if (!window.IntersectionObserver) return measure([[form, label]])
  observer = observer || new window.IntersectionObserver(entries => {
    const seen = []
    for (const entry of entries) {
      if (!entry.isIntersecting || !waiting.has(entry.target)) continue
      observer.unobserve(entry.target)
      seen.push([entry.target, waiting.get(entry.target)])
      waiting.delete(entry.target)
    }
    if (seen.length) measure(seen) // every form reported at once is read before any is written to
  }, { rootMargin: '100% 0px' })
  waiting.set(form, label)
  observer.observe(form)
}

module.exports = { getOS, insertAfter, setInkOffset }
