import sketch from 'sketch/dom'
import Settings from 'sketch/settings'
import UI from 'sketch/ui'
import {
  isSupportedVersion,
  hasNoColors,
  hasColorsWithoutName,
  hasFindMethodSupport
} from './common'

const Style = sketch.Style
const sketchVersion = sketch.version.sketch
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors
const savedDarkThemeColors = Settings.settingForKey(`${doc.id}-dark-theme-colors`)

const switchColor = (color) => {
  const foundColor = documentColors.find((documentColor) => {
    return documentColor.color === color
  })

  if (foundColor) {
    return getDarkThemeColor(foundColor)
  }

  return color
}

const getDarkThemeColor = (documentColor) => {
  const foundColor = savedDarkThemeColors.find((darkThemeColor) => {
    return darkThemeColor.name === documentColor.name
  })

  if (foundColor) {
    return foundColor.color
  }

  return documentColor.color
}

const switchArtboardTheme = (artboard) => {
  artboard.background.color = switchColor(artboard.background.color)
}

const switchTextTheme = (textLayer) => {
  textLayer.style.textColor = switchColor(textLayer.style.textColor)
}

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

const switchSymbolInstanceTheme = (symbolInstance) => {
  const group = symbolInstance.detach()

  if (!hasFindMethodSupport(sketchVersion)) {
    switchNativeLayersBasedOnType(group, 'SymbolInstance')
  } else {
    const groupLayers = sketch.find('*', group)

    groupLayers.forEach((groupLayer) => {
      switchLayerThemeBasedOnType(groupLayer)
    })
  }
}

const switchSymbolMasterTheme = (symbolMaster) => {
  if (!hasFindMethodSupport(sketchVersion)) {
    switchNativeLayersBasedOnType(symbolMaster, 'SymbolMaster')
  } else {
    const masterLayers = sketch.find('*', symbolMaster)

    masterLayers.forEach((masterLayer) => {
      switchLayerThemeBasedOnType(masterLayer)
    })
  }
}

const switchNativeLayersBasedOnType = (context, type) => {
  const nativeLayers = context.sketchObject.children()

  nativeLayers.forEach((nativeLayer) => {
    const layer = sketch.fromNative(nativeLayer)

    if (layer.type !== type) {
      switchLayerThemeBasedOnType(layer)
    }
  })
}

const switchLayerThemeBasedOnType = (layer) => {
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

export default () => {
  if (!isSupportedVersion(sketchVersion)) {
    UI.message('⚠️ This plugin only works on Sketch 53 or above.')
    return
  }

  const selectedPage = doc.selectedPage

  if (!selectedPage) {
    UI.message('⚠️ Please select a page first.')
    return
  }

  if (hasNoColors(doc)) {
    UI.message('⚠️ You have to create document colors first for the plugin to work.')
    return false
  }

  if (hasColorsWithoutName(documentColors)) {
    UI.message('⚠️ Please set a name to all the document colors.')
    return
  }

  if (!savedDarkThemeColors || savedDarkThemeColors.length === 0) {
    UI.message('⚠️ Please create the color palette first.')
    return
  }

  UI.message('⏳ Generating...')

  const duplicatePage = selectedPage.duplicate()
  duplicatePage.name = `[Dark mode] - ${selectedPage.name}`

  if (selectedPage.isSymbolsPage()) {
    let symbolMasters = []

    if (!hasFindMethodSupport(sketchVersion)) {
      symbolMasters = duplicatePage.layers.filter((layer) => {
        return layer.type === 'SymbolMaster'
      })
    } else {
      symbolMasters = sketch.find('SymbolMaster', duplicatePage)
    }

    symbolMasters.forEach((symbolMaster) => {
      switchLayerThemeBasedOnType(symbolMaster)
    })
  } else {
    let artboards = []

    if (!hasFindMethodSupport(sketchVersion)) {
      artboards = duplicatePage.layers.filter((layer) => {
        return layer.type === 'Artboard'
      })
    } else {
      artboards = sketch.find('Artboard', duplicatePage)
    }

    artboards.forEach((artboard) => {
      if (artboard.background.enabled) {
        switchArtboardTheme(artboard)
      }

      if (!hasFindMethodSupport(sketchVersion)) {
        switchNativeLayersBasedOnType(artboard, 'Artboard')
      } else {
        const layers = sketch.find('*', artboard)

        layers.forEach((layer) => {
          switchLayerThemeBasedOnType(layer)
        })
      }
    }) 
  }

  UI.message('🎉 Dark theme generated!')
}
