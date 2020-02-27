/**
 * 
 * @param {String} version 
 * @returns {Boolean}
 */
export const isSupportedVersion = (version) => {
  if (version >= '53') {
    return true
  }

  return false
}

/**
 * 
 * @param {String} version 
 * @returns {Boolean}
 */
export const hasFindMethodSupport = (version) => {
  if (version >= '56') {
    return true
  }

  return false
}

/**
 * 
 * @param {Document} document 
 * @returns {Boolean}
 */
export const hasNoColors = (document) => {
  if (document.colors.length === 0) {
    return true
  }

  return false
}

/**
 * 
 * @param {Array} documentColors 
 * @returns {Boolean}
 */
export const hasColorsWithoutName = (documentColors) => {
  let result = false

  for (let i = 0; i < documentColors.length; i++) {
    if (!documentColors[i].name || documentColors[i].name.length === 0) {
      result = true
      break
    }
  }

  return result
}
