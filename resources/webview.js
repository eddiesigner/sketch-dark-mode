import Vue from './lib/vue'
import Verte from './lib/verte'
import {
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

// savedDarkThemeColors,

window.createPaletteUI = (
  schemes,
) => {
  app = new Vue({
    el: '#app',
    components: {
      verte: Verte,
    },
    data: {
      selectedSchemeId: "document",
      schemes: {},
      paletteColors: [],
      savedDarkThemeColors: []
    },
    computed: {
      paletteColorsHaveErrors() {
        return this.paletteColors.length === 0 || hasColorsWithoutName(this.paletteColors)
      },
      showColors() {
        return this.selectedSchemeId &&
          this.paletteColors.length > 0 &&
          !this.paletteColorsHaveErrors
      },
      errorMessage() {
        const fileTye = this.selectedSchemeId === "document" ? "document" : "library"

        return `1. Please be sure to create Color Variables for your ${fileTye} in Sketch first (or Color Presets if you\'re not running Sketch 69 or above).<br><br>2. Also make sure that all colors are assigned a unique name (default hex color names are not supported) and that your layers use those colors.<br><br>3. If your colors are defined in a Library, make sure you select it by switching to library mode from the gear button at the top.`
      }
    },
    watch: {
      selectedSchemeId() {
        this.selectScheme()
      }
    },
    mounted() {

      this.schemes = schemes

      this.selectScheme()
    },
    methods: {
      selectScheme () {
        if(!this.schemes[this.selectedSchemeId]){
          this.selectedSchemeId = "document"
          return
        }

        this.paletteColors = this.orderColorsByName(this.schemes[this.selectedSchemeId].colors)
      },
      orderColorsByName(colors) {
        if (colors.length > 0) {
          return colors.sort((a, b) => {
            return a.name.localeCompare(b.name)
          })
        }

        return []
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
        window.postMessage('saveDarkThemePalette', this.schemes)
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
