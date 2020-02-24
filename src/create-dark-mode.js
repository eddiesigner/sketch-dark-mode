import sketch from 'sketch/dom'

const Style = sketch.Style
const sketchVersion = sketch.version.sketch
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors
const darkThemeColors = [
  {
    type: 'ColorAsset', name: 'foreground', color: '#efefefff'
  },
  {
    type: 'ColorAsset', name: 'background', color: '#000000ff'
  },
  {
    type: 'ColorAsset', name: 'border', color: '#222222ff'
  },
  {
    type: 'ColorAsset', name: 'subtle', color: '#111111ff'
  },
  {
    type: 'ColorAsset', name: 'text', color: '#ddddddff'
  },
  {
    type: 'ColorAsset', name: 'secondary-subtle', color: '#0a0a0cff'
  },
  {
    type: 'ColorAsset', name: 'empty', color: '#141414ff'
  },
  {
    type: 'ColorAsset', name: 'success', color: '#c7f7caff'
  },
  {
    type: 'ColorAsset', name: 'placeholder', color: '#6f6f6fff'
  }
]

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
  const foundColor = darkThemeColors.find((darkThemeColor) => {
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

  if (sketchVersion < '56') {
    const nativeLayers = group.sketchObject.children()

    nativeLayers.forEach((nativeLayer) => {
      const layer = sketch.fromNative(nativeLayer)

      if (layer.type !== 'SymbolInstance') {
        switchLayerThemeBasedOnType(layer)
      }
    })
  } else {
    const groupLayers = sketch.find('*', group)

    groupLayers.forEach((groupLayer) => {
      switchLayerThemeBasedOnType(groupLayer)
    })
  }
}

const switchSymbolMasterTheme = (symbolMaster) => {
  if (sketchVersion < '56') {
    const nativeLayers = symbolMaster.sketchObject.children()

    nativeLayers.forEach((nativeLayer) => {
      const layer = sketch.fromNative(nativeLayer)

      if (layer.type !== 'SymbolMaster') {
        switchLayerThemeBasedOnType(layer)
      }
    })
  } else {
    const masterLayers = sketch.find('*', symbolMaster)

    masterLayers.forEach((masterLayer) => {
      switchLayerThemeBasedOnType(masterLayer)
    })
  }
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
  const selectedPage = doc.selectedPage
  const duplicatePage = selectedPage.duplicate()

  duplicatePage.name = `[Dark mode] - ${selectedPage.name}`

  if (selectedPage.isSymbolsPage()) {
    let symbolMasters = []

    if (sketchVersion < '56') {
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

    if (sketchVersion < '56') {
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

      if (sketchVersion < '56') {
        const nativeLayers = artboard.sketchObject.children()

        nativeLayers.forEach((nativeLayer) => {
          const layer = sketch.fromNative(nativeLayer)

          if (layer.type !== 'Artboard') {
            switchLayerThemeBasedOnType(layer)
          }
        })
      } else {
        const layers = sketch.find('*', artboard)

        layers.forEach((layer) => {
          switchLayerThemeBasedOnType(layer)
        })
      }
    }) 
  }
}
