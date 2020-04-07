import sketch from 'sketch/dom'
import Settings from 'sketch/settings'

const sketchVersion = sketch.version.sketch
const Style = sketch.Style
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors
const settingsKey = `${doc.id}-dark-theme-colors`
const savedDarkThemeColors =
  Settings.settingForKey(settingsKey) ||
  Settings.documentSettingForKey(doc, settingsKey)

/**
 * 
 * @returns {Boolean}
 */
export const isSketchSupportedVersion = () => {
  if (sketchVersion >= '53') {
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
 * @param {Artboard} artboard 
 */
export const switchArtboardTheme = (artboard) => {
  artboard.background.color = switchColor(artboard.background.color)
}

/**
 * 
 * @param {*} context 
 * @param {String} type 
 */
export const switchNativeLayersBasedOnType = (context, type) => {
  const nativeLayers = context.sketchObject.children()

  nativeLayers.forEach((nativeLayer) => {
    const layer = sketch.fromNative(nativeLayer)

    if (layer.type !== type) {
      switchLayerThemeBasedOnType(layer)
    }
  })
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
  const foundColor = documentColors.find((documentColor) => {
    return documentColor.color === color
  })

  if (foundColor) {
    return getDarkThemeColor(foundColor)
  }

  return color
}


/**
 * 
 * @param {ColorAsset} documentColor 
 * @returns {ColorAsset}
 */
const getDarkThemeColor = (documentColor) => {
  const foundColor = savedDarkThemeColors.find((darkThemeColor) => {
    return darkThemeColor.name === documentColor.name
  })

  if (foundColor) {
    return foundColor.color
  }

  return documentColor.color
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
        if (style.fillType === Style.FillType.Color) {
          style.color = switchColor(style.color)
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
