import Vue from './lib/vue'
import Verte from './lib/verte'
import {
  getAlphaValue,
  setAlphaValue,
  isValidColor,
  getRegularHexValue,
  hasColorsWithoutName
} from './utils'

Vue.component(Verte.name, Verte)

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

window.createPaletteUI = (
  savedSchemeType,
  documentColors,
  savedDarkThemeColors,
  libraries,
  savedLibraryId
) => {
  app = new Vue({
    el: '#app',
    components: {
      verte: Verte,
    },
    data: {
      schemeType: 'document',
      paletteColors: [],
      savedDarkThemeColors: [],
      libraries: [],
      selectedLibraryId: '',
      selectedLibraryColors: [],
      showSettingsMenu: false
    },
    computed: {
      isDocumentSchemeSelected() {
        return this.schemeType === 'document'
      },
      paletteColorsHaveErrors() {
        return this.paletteColors.length === 0 || hasColorsWithoutName(this.paletteColors)
      },
      showColorList() {
        if (this.isDocumentSchemeSelected) {
          return this.paletteColors.length > 0 && !this.paletteColorsHaveErrors
        }

        return this.selectedLibraryId &&
          this.paletteColors.length > 0 &&
          !this.paletteColorsHaveErrors
      },
      showErrorMessage() {
        if (this.isDocumentSchemeSelected) {
          return this.paletteColorsHaveErrors
        }

        return this.selectedLibraryId &&
          (
            this.paletteColors.length === 0 ||
            hasColorsWithoutName(this.paletteColors)
          )
      },
      errorMessage() {
        const fileTye = this.isDocumentSchemeSelected ? 'document' : 'library'

        return `1. Please be sure to create Color Variables for your ${fileTye} in Sketch first (or Color Presets if you\'re not running Sketch 69 or above).<br><br>2. Also make sure that all colors are assigned a unique name (default hex color names are not supported) and that your layers use those colors.<br><br>3. If your colors are defined in a Library, make sure you select it by switching to library mode from the gear button at the top.`
      }
    },
    watch: {
      schemeType() {
        this.switchPalette()
      },
      selectedLibraryId() {
        if (this.selectedLibraryId) {
          this.switchPalette()
        } else {
          this.paletteColors = []
        }
      }
    },
    mounted() {
      if (savedSchemeType != null) {
        this.schemeType = savedSchemeType
      }

      if (savedLibraryId != null) {
        this.selectedLibraryId = savedLibraryId
      }

      this.savedDarkThemeColors = savedDarkThemeColors
      this.libraries = libraries

      this.switchPalette()
    },
    methods: {
      makePaletteColors(currentColors) {
        const mappedColors = []

        currentColors.forEach((currentColor) => {
          let darkColor = null

          if (this.savedDarkThemeColors && this.savedDarkThemeColors.length > 0) {
            darkColor = this.savedDarkThemeColors.find((darkThemeColor) => {
              return darkThemeColor.name === currentColor.name
            })
          }

          mappedColors.push({
            type: currentColor.type,
            name: currentColor.name,
            lightRawColor: currentColor.color,
            lightColor: getRegularHexValue(currentColor.color),
            lightAlpha: getAlphaValue(currentColor.color),
            darkRawColor: darkColor ? darkColor.color : '#',
            darkColor:
              darkColor ? getRegularHexValue(darkColor.color) : '#',
            darkAlpha: darkColor ? getAlphaValue(darkColor.color) : 1,
            isValidColor:
              darkColor ? isValidColor(getRegularHexValue(darkColor.color)) : false
          })
        })

        return this.orderColorsByName(mappedColors)
      },
      orderColorsByName(colors) {
        if (colors.length > 0) {
          return colors.sort(function (a, b) {
            return a.name.localeCompare(b.name)
          })
        }

        return []
      },
      switchPalette() {
        if (this.isDocumentSchemeSelected) {
          this.paletteColors = this.makePaletteColors(documentColors)
        } else if (this.selectedLibraryId) {
          this.paletteColors = this.makePaletteColors(this.getColorsFromLibrary())
        }
      },
      getColorsFromLibrary() {
        if (this.libraries.length > 0 && this.selectedLibraryId) {
          const foundLibrary = this.libraries.find((library) => {
            return library.id === this.selectedLibraryId
          })

          if (foundLibrary) {
            return foundLibrary.colors
          }
        }

        return []
      },
      selectScheme(scheme) {
        this.schemeType = scheme
        this.toggleSettingsMenu()
      },
      toggleSettingsMenu() {
        this.showSettingsMenu = !this.showSettingsMenu
      },
      updatePaletteDarkColor(colorName, $event, fromColorPicker = false) {
        const foundColorIndex = this.paletteColors.findIndex((paletteColor) => {
          return paletteColor.name === colorName
        })

        if (foundColorIndex !== -1) {
          let hexValue = ''
          const foundColor = this.paletteColors[foundColorIndex]

          if (fromColorPicker) {
            const colorParts = $event.split('.')

            if (colorParts[0].length > 8) {
              hexValue = getRegularHexValue(colorParts[0])
            } else if (colorParts[0].length > 7) {
              hexValue = getRegularHexValue(colorParts[0], -1)
            } else {
              hexValue = colorParts[0]
            }

            if (foundColor.darkColor === hexValue) {
              return
            }
          } else {
            hexValue = $event.target.value
          }

          if (hexValue.length === 7 && isValidColor(hexValue)) {
            const newColor = {
              ...foundColor,
              darkRawColor: setAlphaValue(hexValue, foundColor.darkAlpha),
              darkColor: hexValue,
              isValidColor: isValidColor(hexValue)
            }

            Vue.set(this.paletteColors, foundColorIndex, newColor)
          }
        }
      },
      updatePaletteDarkAlpha(colorName, $event) {
        const foundColorIndex = this.paletteColors.findIndex((paletteColor) => {
          return paletteColor.name === colorName
        })

        if (foundColorIndex !== -1) {
          const foundColor = this.paletteColors[foundColorIndex]
          const alphaValue = parseInt($event.target.value) / 100
          const newColor = {
            ...foundColor,
            darkRawColor: setAlphaValue(foundColor.darkColor, alphaValue),
            darkAlpha: alphaValue,
          }

          Vue.set(this.paletteColors, foundColorIndex, newColor)
        }
      },
      savePalette() {
        const darkThemeColors = []

        this.paletteColors.forEach((paletteColor) => {
          if (isValidColor(paletteColor.darkColor)) {
            darkThemeColors.push({
              type: paletteColor.type,
              name: paletteColor.name,
              color: paletteColor.darkRawColor
            })
          }
        })

        window.postMessage('saveDarkThemePalette', {
          schemeType: this.schemeType,
          selectedLibraryId: this.selectedLibraryId,
          darkThemeColors
        })
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
  e.preventDefault()
})
