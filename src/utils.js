import Settings from 'sketch/settings'
import sketch from 'sketch/dom'

/**
 * 
 * @param {Document} doc 
 * @returns {Object}
 */
export const getDocumentData = (doc) => {
  return Settings.settingForKey(`${doc.id}-dark-mode-colors`) ||
    Settings.documentSettingForKey(doc, `${doc.id}-dark-mode-colors`)
}

/**
 * 
 * @param {Number} version 
 * @return {Boolean}
 */
const isSketchVersion = (version) => {
  const sketchVersion = parseFloat(sketch.version.sketch)

  if (sketchVersion >= version) {
    return true
  }

  return false
}

/**
 * 
 * @returns {Boolean}
 */
export const isSketchSupportedVersion = () => {
  return isSketchVersion(54)
}

/**
 * 
 * @returns {Boolean}
 */
export const hasSketchFindMethodSupport = () => {
  return isSketchVersion(56)
}

/**
 *
 * @returns {Boolean}
 */
export const hasSketchFillTypeSupport = () => {
  return isSketchVersion(55)
}

/**
 *
 * @returns {Boolean}
 */
export const hasSketchColorVariablesSupport = () => {
  return isSketchVersion(69)
}
