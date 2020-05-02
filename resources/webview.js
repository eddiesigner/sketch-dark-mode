import Vue from './vue'
import {
  isValidColor,
  getRegularHexValue,
  hasColorsWithoutName,
  generateRandomColor
} from './utils'

/**
 * 
 * @param {Event} event 
 */
const interceptClickEvent = (event) => {
  const target = event.target.closest('a')

  if (target && target.getAttribute('target') === '_blank') {
    event.preventDefault()
    window.postMessage('externalLinkClicked', target.href)
  }
}

window.createPaletteUI = (documentColors, savedDarkThemeColors, libraries) => {
  app = new Vue({
    el: '#app',
    data: {
      schemeType: 'document',
      paletteColors: [],
      savedDarkThemeColors: [],
      libraries: [],
      showSettingsMenu: false,
      appIsReady: false
    },
    computed: {
      isDocumentSchemeSelected() {
        return this.schemeType === 'document'
      },
      paletteColorsHaveErrors() {
        return
          this.paletteColors.length === 0 &&
          hasColorsWithoutName(this.paletteColors)
      }
    },
    mounted() {
      this.savedDarkThemeColors = savedDarkThemeColors
      this.libraries = libraries
      this.paletteColors = this.makePaletteColors(documentColors)
      this.appIsReady = true
      console.log(this.paletteColors)
    },
    methods: {
      makePaletteColors(currentColors) {
        const mappedColors = []

        currentColors.forEach((currentColor) => {
          const darkColor = this.savedDarkThemeColors.find((darkThemeColor) => {
            return darkThemeColor.name === currentColor.name
          })

          if (darkColor) {
            mappedColors.push({
              type: currentColor.type,
              name: currentColor.name,
              lightColor: getRegularHexValue(currentColor.color),
              darkColor: getRegularHexValue(darkColor.color),
              isValidColor: isValidColor(getRegularHexValue(darkColor.color))
            })
          }
        })

        return mappedColors
      },
      selectScheme(scheme) {
        this.schemeType = scheme
      },
      toggleSettingsMenu() {
        this.showSettingsMenu = !this.showSettingsMenu
      },
      updatePaletteDarkColor(colorName, $event) {
        const foundColorIndex = this.paletteColors.findIndex((paletteColor) => {
          return paletteColor.name === colorName
        })

        if (foundColorIndex !== -1) {
          const newColor = {
            ...this.paletteColors[foundColorIndex],
            darkColor: $event.target.value,
            isValidColor: isValidColor($event.target.value)
          }

          Vue.set(this.paletteColors, foundColorIndex, newColor)
        }
      },
      setInputRandomColorValue($event) {
        $event.target.value = generateRandomColor()
      },
      savePalette() {
        this.closeWindow()
      },
      closeWindow() {
        window.postMessage('closeWindow')
      }
    }
  })
}

// listen for link click events at the document level
document.addEventListener('click', interceptClickEvent)

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  // e.preventDefault()
})
