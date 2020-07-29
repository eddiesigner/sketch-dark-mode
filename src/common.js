import sketch from 'sketch/dom'
import Settings from 'sketch/settings'

const sketchVersion = sketch.version.sketch
const Style = sketch.Style
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors
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
const libraries = sketch.getLibraries()
let baseColors = []

if (!savedSchemeType != null && savedSchemeType === 'document') {
  baseColors = documentColors
} else if (!savedSchemeType != null && savedSchemeType === 'library') {
  if (libraries.length > 0 && savedLibraryId != null) {
    const foundLibrary = libraries.find((library) => {
      return library.id === savedLibraryId
    })

    if (foundLibrary) {
      try {
        const libDocument = foundLibrary.getDocument()
        baseColors = libDocument.colors
      } catch (error) {
        console.log(error)
      }
    }
  }
}

/**
 * 
 * @returns {Boolean}
 */
export const isSketchSupportedVersion = () => {
  if (sketchVersion >= '54') {
    return true
  }

  return false
}

/**
 * 
 * @returns {Boolean}
 */
export const hasSketchFindMethodSupport = () => {
  if (sketchVersion >= '56') {
    return true
  }

  return false
}

/**
 *
 * @returns {Boolean}
 */
export const hasSketchFillTypeSupport = () => {
  if (sketchVersion >= '55') {
    return true
  }

  return false
}

/**
 * 
 * @returns {Boolean}
 */
export const hasDocumentNoColors = () => {
  if (doc.colors.length === 0) {
    return true
  }

  return false
}

/**
 * 
 * @returns {Boolean}
 */
export const hasDocumentColorsWithoutName = () => {
  let result = false

  for (let i = 0; i < documentColors.length; i++) {
    if (!documentColors[i].name || documentColors[i].name.length === 0) {
      result = true
      break
    }
  }

  return result
}

/**
 *
 * @returns {Boolean}
 */
export const isDarkPaletteEmpty = () => {
  return !savedDarkThemeColors || savedDarkThemeColors.length === 0
}

/**
 *
 * @returns {Page}
 */
export const getSelectedPage = () => {
  return doc.selectedPage
}

/**
 *
 * @returns {Array}
 */
export const getSelectedLayers = () => {
  const selection = doc.selectedLayers

  return selection.length > 0 ? selection.layers : []
}

/**
 * 
 * @param {Layer} element 
 * @param {String} layerType 
 */
export const getLayersFromElement = (element, layerType) => {
  let layers = []

  if (!hasSketchFindMethodSupport()) {
    layers = element.layers.filter((layer) => {
      return layer.type === layerType
    })
  } else {
    layers = sketch.find(layerType, element)
  }

  return layers
}

/**
 * 
 * @param {Artboard} artboard 
 */
export const switchArtboardTheme = (artboard) => {
  artboard.background.color = switchColor(artboard.background.color)
}

/**
 * 
 * @param {*} context 
 * @param {String} type 
 * @returns {Array}
 */
export const switchNativeLayersBasedOnType = (context, type) => {
  const nativeLayers = context.sketchObject.children()

  nativeLayers.forEach((nativeLayer) => {
    const layer = sketch.fromNative(nativeLayer)

    if (layer.type !== type) {
      switchLayerThemeBasedOnType(layer)
    }
  })

  return nativeLayers
}

/**
 * 
 * @param {Layer} layer 
 */
export const switchLayerThemeBasedOnType = (layer) => {
  switch (layer.type) {
    case 'Text':
      switchTextTheme(layer)
      break;
    case 'Group':
    case 'Shape':
    case 'ShapePath':
      switchShapeTheme(layer)
      break;
    case 'SymbolInstance':
      switchSymbolInstanceTheme(layer)
      break;
    case 'SymbolMaster':
      switchSymbolMasterTheme(layer)
      break;
    default:
      break;
  }
}

/**
 * 
 * @param {Page} page 
 */
export const selectPage = (page) => {
  doc.selectedPage = page
}

/**
 * 
 * @param {ColorAsset} color 
 * @returns {ColorAsset}
 */
const switchColor = (color) => {
  if (baseColors.length > 0) {
    const foundColor = baseColors.find((currentColor) => {
      return currentColor.color === color
    })

    if (foundColor) {
      return getDarkThemeColor(foundColor)
    }
  }

  return color
}

/**
 * 
 * @param {ColorAsset} baseColor 
 * @returns {ColorAsset}
 */
const getDarkThemeColor = (baseColor) => {
  const foundColor = savedDarkThemeColors.find((darkThemeColor) => {
    return darkThemeColor.name === baseColor.name
  })

  if (foundColor) {
    return foundColor.color
  }

  return baseColor.color
}

/**
 * 
 * @param {Text} textLayer 
 */
const switchTextTheme = (textLayer) => {
  textLayer.style.textColor = switchColor(textLayer.style.textColor)
}

/**
 * 
 * @param {Shape} shapeLayer 
 */
const switchShapeTheme = (shapeLayer) => {
  const styleTypes = ['fills', 'borders']

  styleTypes.forEach((styleType) => {
    if (shapeLayer.style[styleType].length > 0) {
      const newStyle = shapeLayer.style[styleType].map((style) => {
        const fillType = hasSketchFillTypeSupport() ? style.fillType : style.fill

        if (fillType === Style.FillType.Color) {
          style.color = switchColor(style.color)
        }

        if (fillType === Style.FillType.Gradient) {
          const stops = style.gradient.stops

          for (let i = 0, l = stops.length; i < l; i++) {
            stops[i].color = switchColor(stops[i].color)
          }
        }

        return style
      })

      shapeLayer.style[styleType] = newStyle
    }
  })
}

/**
 * 
 * @param {SymbolInstance} symbolInstance 
 */
const switchSymbolInstanceTheme = (symbolInstance) => {
  const group = symbolInstance.detach()

  if (!hasSketchFindMethodSupport()) {
    switchNativeLayersBasedOnType(group, 'SymbolInstance')
  } else {
    const groupLayers = sketch.find('*', group)

    groupLayers.forEach((groupLayer) => {
      switchLayerThemeBasedOnType(groupLayer)
    })
  }
}

/**
 * 
 * @param {SymbolMaster} symbolMaster 
 */
const switchSymbolMasterTheme = (symbolMaster) => {
  if (!hasSketchFindMethodSupport()) {
    switchNativeLayersBasedOnType(symbolMaster, 'SymbolMaster')
  } else {
    const masterLayers = sketch.find('*', symbolMaster)

    masterLayers.forEach((masterLayer) => {
      switchLayerThemeBasedOnType(masterLayer)
    })
  }
}
