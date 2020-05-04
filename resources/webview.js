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

window.createPaletteUI = (
  savedSchemeType,
  documentColors,
  savedDarkThemeColors,
  libraries,
  savedLibraryId
) => {
  app = new Vue({
    el: '#app',
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
        if (this.isDocumentSchemeSelected) {
          return 'You have to create document colors first for the plugin to work. Also make sure that all the document colors have been assigned an unique name.'
        } else {
          return 'Make sure the library you selected has document colors. Also make sure that all those colors have been assigned an unique name.'
        }
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
        console.log(this.savedDarkThemeColors)

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
            lightColor: getRegularHexValue(currentColor.color),
            darkColor:
              darkColor ? getRegularHexValue(darkColor.color) : '#',
            isValidColor:
              darkColor ? isValidColor(getRegularHexValue(darkColor.color)) : false
          })
        })

        return mappedColors
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
        const darkThemeColors = []

        this.paletteColors.forEach((paletteColor) => {
          if (isValidColor(paletteColor.darkColor)) {
            darkThemeColors.push({
              type: paletteColor.type,
              name: paletteColor.name,
              color: `${paletteColor.darkColor}ff`
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
  // e.preventDefault()
})
