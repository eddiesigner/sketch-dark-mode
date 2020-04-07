import sketch from 'sketch/dom'
import UI from 'sketch/ui'
import {
  isSketchSupportedVersion,
  hasDocumentNoColors,
  hasDocumentColorsWithoutName,
  hasSketchFindMethodSupport,
  isDarkPaletteEmpty,
  getSelectedPage,
  switchLayerThemeBasedOnType,
  switchArtboardTheme,
  switchNativeLayersBasedOnType,
  selectPage
} from './common'

export default () => {
  if (!isSketchSupportedVersion()) {
    UI.message('⚠️ This plugin only works on Sketch 54 or above.')
    return
  }

  const selectedPage = getSelectedPage()

  if (!selectedPage) {
    UI.message('⚠️ Please select a page first.')
    return
  }

  if (hasDocumentNoColors()) {
    UI.message('⚠️ You have to create document colors first for the plugin to work.')
    return false
  }

  if (hasDocumentColorsWithoutName()) {
    UI.message('⚠️ Please set a name to all the document colors.')
    return
  }

  if (isDarkPaletteEmpty()) {
    UI.message('⚠️ Please create the color palette first.')
    return
  }

  UI.message('⏳ Generating...')

  const duplicatedPage = selectedPage.duplicate()
  duplicatedPage.name = `[Dark mode] - ${selectedPage.name}`

  if (selectedPage.isSymbolsPage()) {
    let symbolMasters = []

    if (!hasSketchFindMethodSupport()) {
      symbolMasters = duplicatedPage.layers.filter((layer) => {
        return layer.type === 'SymbolMaster'
      })
    } else {
      symbolMasters = sketch.find('SymbolMaster', duplicatedPage)
    }

    symbolMasters.forEach((symbolMaster) => {
      switchLayerThemeBasedOnType(symbolMaster)
    })
  } else {
    let artboards = []

    if (!hasSketchFindMethodSupport()) {
      artboards = duplicatedPage.layers.filter((layer) => {
        return layer.type === 'Artboard'
      })
    } else {
      artboards = sketch.find('Artboard', duplicatedPage)
    }

    artboards.forEach((artboard) => {
      if (artboard.background.enabled) {
        switchArtboardTheme(artboard)
      }

      if (!hasSketchFindMethodSupport()) {
        switchNativeLayersBasedOnType(artboard, 'Artboard')
      } else {
        const layers = sketch.find('*', artboard)

        layers.forEach((layer) => {
          switchLayerThemeBasedOnType(layer)
        })
      }
    }) 
  }

  selectPage(duplicatedPage)
  UI.message('🎉 Dark theme generated!')
}
