import chroma from './lib/chroma'

/**
 * 
 * @param {String} color 
 * @returns {Float}
 */
export const getAlphaValue = (color) => {
  return chroma(color).alpha()
}

/**
 * 
 * @param {String} color 
 * @param {Float} alpha 
 * @returns {String}
 */
export const setAlphaValue = (color, alpha) => {
  return chroma(color).alpha(alpha).hex()
}

/**
 * 
 * @param {String} color 
 * @returns {Boolean}
 */
export const isValidColor = (color) => {
  return chroma.valid(color)
}

/**
 * 
 * @param {String} value 
 * @param {Number} end 
 * @returns {String}
 */
export const getRegularHexValue = (value, end = -2) => {
  return value.slice(0, end)
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
