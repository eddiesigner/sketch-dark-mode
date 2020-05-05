import sketch from 'sketch/dom'
import UI from 'sketch/ui'
import {
  isSketchSupportedVersion,
  getSelectedLayers,
  hasSketchFindMethodSupport,
  isDarkPaletteEmpty,
  switchLayerThemeBasedOnType,
  switchArtboardTheme,
  switchNativeLayersBasedOnType
} from './common'

export default () => {
  if (!isSketchSupportedVersion()) {
    UI.message('⚠️ This plugin only works on Sketch 54 or above.')
    return
  }

  const selectedLayers = getSelectedLayers()

  if (selectedLayers.length === 0) {
    UI.message('⚠️ You have to select at least one layer.')
    return
  }

  if (isDarkPaletteEmpty()) {
    UI.message('⚠️ Please create the color palette first.')
    return
  }

  UI.message('⏳ Generating...')

  const duplicatedLayers = []
  let lastPositionX = 0

  for (let i = 0, l = selectedLayers.length; i < l; i++) {
    const selectedLayer = selectedLayers[i]

    if (selectedLayer.type === 'Artboard') {
      const duplicatedLayer = selectedLayer.duplicate()
      duplicatedLayer.name = `[Dark mode] - ${selectedLayer.name}`
      duplicatedLayer.moveToFront()
      duplicatedLayers.push(duplicatedLayer)

      if (i === l - 1) {
        lastPositionX = selectedLayer.frame.x + selectedLayer.frame.width + 100
      }

      if (duplicatedLayer.background.enabled) {
        switchArtboardTheme(duplicatedLayer)
      }

      if (!hasSketchFindMethodSupport()) {
        switchNativeLayersBasedOnType(duplicatedLayer, 'Artboard')
      } else {
        const layers = sketch.find('*', duplicatedLayer)

        layers.forEach((layer) => {
          switchLayerThemeBasedOnType(layer)
        })
      }
    }
  }

  if (duplicatedLayers.length > 0) {
    for (let i = 0, l = duplicatedLayers.length; i < l; i++) {
      const duplicatedLayer = duplicatedLayers[i]
      let newPosition = lastPositionX

      if (i > 0) {
        newPosition = duplicatedLayers[i - 1].frame.x + duplicatedLayers[i - 1].frame.width + 100
      }

      duplicatedLayer.frame.x = newPosition
    }

    UI.message('🎉 Dark theme generated!')
  } else {
    UI.message('⚠️ Please select at least one artboard.')
  }
}
