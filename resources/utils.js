/**
 * 
 * @param {String} value 
 * @returns {Boolean}
 */
export const isValidColor = (value) => {
  return /^#[0-9A-F]{6}$/i.test(value)
}

/**
 * 
 * @param {String} value 
 * @returns {String}
 */
export const getRegularHexValue = (value) => {
  return value.slice(0, -2)
}

export const generateRandomColor = () => {
  return `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`
}

/**
 * 
 * @param {Array} colors 
 * @returns {Boolean}
 */
export const hasColorsWithoutName = (colors) => {
  let result = false

  for (let i = 0; i < colors.length; i++) {
    if (!colors[i].name || colors[i].name.length === 0) {
      result = true
      break
    }
  }

  return result
}
