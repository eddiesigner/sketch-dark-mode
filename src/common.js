import sketch from 'sketch/dom'
import {
  getDocumentData,
  hasSketchFindMethodSupport,
  hasSketchFillTypeSupport
} from './utils'

const Style = sketch.Style
const doc = sketch.getSelectedDocument()
const documentData = getDocumentData(doc)
const libraries = sketch.getLibraries()

/**
 *
 * @returns {Boolean}
 */
export const isDarkPaletteEmpty = () => {
  // return !savedDarkThemeColors || savedDarkThemeColors.length === 0
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
 * @returns {Array}
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
  if (artboard.name.includes('[skip-dark-mode]')) {
    return
  }

  artboard.background.color = switchColor(artboard.sketchObject.backgroundColor())
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
  if (
    layer.name.includes('[skip-dark-mode]') ||
    layer.parent.name.includes('[skip-dark-mode]')
  ) {
    return
  }

  switch (layer.type) {
    case 'Text':
      switchTextTheme(layer)
      break;
    case 'Group':
    case 'Shape':
    case 'ShapePath':
    case 'Image':
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
 * @param {MSColor} color
 * @returns {Color}
 */
const switchColor = (color) => {

  // Ensure color is associated with a color variable
  if (color.swatchID()) {

    // Look for dark theme color based on color variable name
    const foundColor = documentData && documentData[color.swatchID()]

    // Make sure a dark theme color for this color variable exists
    if (foundColor) {
      return foundColor.darkColor
    }
  }

  // Return same color if no dark theme color is found
  return color
}

/**
 * 
 * @param {Text} textLayer 
 */
const switchTextTheme = (textLayer) => {
  textLayer.style.textColor = switchColor(textLayer.style.sketchObject.textStyle().attributes().MSAttributedStringColorAttribute)
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
          style.color = switchColor(style.sketchObject.color() || style.color)
        }

        if (fillType === Style.FillType.Gradient) {
          const stops = style.gradient.stops

          for (let i = 0, l = stops.length; i < l; i++) {
            stops[i].color = switchColor(stops[i].sketchObject.color() || stops[i].color)
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

  switchShapeTheme(group)

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
