/**
 * Uses the navigator to best determine the clients operating system.
 * @returns Operating system string (`mac`, `windows`, `linux`)
 */
export const getOS = () => {
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

/**
 * Places an element immediately after another element
 * @param {Object} newNode element being placed after the reference node
 * @param {*} referenceNode element to be used as reference for new node
 */
export const insertAfter = (newNode, referenceNode) => {
  if (referenceNode.nextSibling) referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
  else referenceNode.parentNode.appendChild(newNode)
}
