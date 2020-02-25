import $ from './jquery'

const interceptClickEvent = (event) => {
  const target = event.target.closest('a')

  if (target && target.getAttribute('target') === '_blank') {
    event.preventDefault()
    window.postMessage('externalLinkClicked', target.href)
  }
}

window.createPaletteUI = (documentColors) => {
  const $colorsList = $('.js-colors-list')

  if (documentColors.length > 0) {
    const $colorThemePrototype = $('.js-color-theme-prototype')

    documentColors.forEach((documentColor) => {
      const $colorThemeInstance = $colorThemePrototype
        .first()
        .clone()
        .appendTo('.js-colors-list')
        .removeClass('js-color-theme-prototype')
        .addClass('js-color-theme')

      $colorThemeInstance
        .find('.js-color-theme-name')
        .text(documentColor.name)

      const colorValue = documentColor.color.slice(0, -2)

      $colorThemeInstance
        .find('.js-color-theme-input-light')
        .val(colorValue)

      $colorThemeInstance
        .find('.js-color-theme-preview-light')
        .css('background-color', colorValue)
    })

    $colorThemePrototype.remove()
  } else {
    $colorsList.hide()
  }
}

// listen for link click events at the document level
document.addEventListener('click', interceptClickEvent)

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  // e.preventDefault()
})
