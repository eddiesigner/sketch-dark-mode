import sketch from 'sketch/dom'
import UI from 'sketch/ui'
import {
  isDarkPaletteEmpty,
  getSelectedPage,
  getLayersFromElement,
  switchLayerThemeBasedOnType,
  switchArtboardTheme,
  switchNativeLayersBasedOnType,
  selectPage
} from './common'
import {
  isSketchSupportedVersion,
  hasSketchFindMethodSupport
} from './utils'

/**
 * 
 * @param {Array} originalFlowData 
 * @param {Array} duplicatedFlowData
 * @param {Array} layers
 */
const updatePageFlows = (originalFlowData, duplicatedFlowData, layers) => {
  layers.forEach((layer) => {
    if (
      typeof layer.flow !== 'undefined' && !layer.flow.isBackAction()
    ) {
      const originalFlowArtboard = originalFlowData.find((artboard) => {
        return artboard.id === layer.flow.targetId
      })

      if (originalFlowArtboard) {
        const newFlowArtboard = duplicatedFlowData.find((artboard) => {
          return originalFlowArtboard.name === artboard.name
        })

        if (newFlowArtboard) {
          layer.flow.targetId = newFlowArtboard.id
        }
      }
    }
  })
}

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

  if (isDarkPaletteEmpty()) {
    UI.message('⚠️ Please create the color palette first.')
    return
  }

  UI.message('⏳ Generating...')

  const duplicatedPage = selectedPage.duplicate()
  duplicatedPage.name = `[Dark mode] - ${selectedPage.name}`
  
  const originalArtboards = getLayersFromElement(selectedPage, 'Artboard')
  const originalArtboardsInfo = []

  if (originalArtboards.length > 0) {
    originalArtboards.forEach(artboard => {
      originalArtboardsInfo.push({
        id: artboard.id,
        name: artboard.name
      })
    })
  }

  if (selectedPage.isSymbolsPage()) {
    const symbolMasters = getLayersFromElement(duplicatedPage, 'SymbolMaster')

    if (symbolMasters.length > 0) {
      symbolMasters.forEach((symbolMaster) => {
        switchLayerThemeBasedOnType(symbolMaster)
      })
    }

    selectPage(duplicatedPage)
    UI.message('🎉 Dark theme generated!')
  } else if (duplicatedPage.layers.length > 0) {
    const duplicatedArtboards = getLayersFromElement(duplicatedPage, 'Artboard')

    if (duplicatedArtboards.length > 0) {
      const duplicatedArtboardsInfo = duplicatedArtboards.map((artboard) => {
        return {
          id: artboard.id,
          name: artboard.name
        }
      })

      duplicatedArtboards.forEach((artboard) => {
        if (artboard.background.enabled) {
          switchArtboardTheme(artboard)
        }

        let layers = []

        if (!hasSketchFindMethodSupport()) {
          layers = switchNativeLayersBasedOnType(artboard, 'Artboard')

          updatePageFlows(originalArtboardsInfo, duplicatedArtboardsInfo, layers)
        } else {
          layers = sketch.find('*', artboard)

          updatePageFlows(originalArtboardsInfo, duplicatedArtboardsInfo, layers)

          layers.forEach((layer) => {
            switchLayerThemeBasedOnType(layer)
          })
        }
      })
    } else {
      if (!hasSketchFindMethodSupport()) {
        switchNativeLayersBasedOnType(duplicatedPage, 'Page')
      } else {
        const layers = sketch.find('*', duplicatedPage)

        layers.forEach((layer) => {
          switchLayerThemeBasedOnType(layer)
        })
      }
    }

    selectPage(duplicatedPage)
    UI.message('🎉 Dark theme generated!')
  }
}
