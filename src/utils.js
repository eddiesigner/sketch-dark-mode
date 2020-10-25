import Settings from 'sketch/settings'
import sketch from 'sketch/dom'

/**
 * 
 * @param {Document} doc 
 * @returns {Object}
 */
export const getDocumentData = (doc) => {
  const settingsSchemeTypeKey = `${doc.id}-dark-theme-scheme-type`
  const settingsDarkThemeColorsKey = `${doc.id}-dark-theme-colors`
  const settingsSelectedLibraryKey = `${doc.id}-dark-theme-selected-library`

  const savedSchemeType =
    Settings.settingForKey(settingsSchemeTypeKey) ||
    Settings.documentSettingForKey(doc, settingsSchemeTypeKey)
  const savedDarkThemeColors =
    Settings.settingForKey(settingsDarkThemeColorsKey) ||
    Settings.documentSettingForKey(doc, settingsDarkThemeColorsKey)
  const savedLibraryId =
    Settings.settingForKey(settingsSelectedLibraryKey) ||
    Settings.documentSettingForKey(doc, settingsSelectedLibraryKey)

  return {
    savedSchemeType:
      typeof savedSchemeType !== 'undefined' ? savedSchemeType : 'document',
    savedDarkThemeColors,
    savedLibraryId
  }
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

/**
 * 
 * @param {Document} doc 
 * @return {Array}
 */
export const getDocumentColors = (doc) => {
  if (hasSketchColorVariablesSupport() && doc.colors.length === 0) {
    return doc.swatches
  }

  return doc.colors
}
