import Settings from 'sketch/settings'

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
    savedSchemeType,
    savedDarkThemeColors,
    savedLibraryId
  }
}

/**
 * 
 * @param {Sketch} sketch 
 * @param {Number} version 
 * @return {Boolean}
 */
export const isSketchVersion = (sketch, version) => {
  const sketchVersion = parseFloat(sketch.version.sketch)

  if (sketchVersion >= version) {
    return true
  }

  return false
}
