import sketch from 'sketch/dom'
import Settings from 'sketch/settings'
import UI from 'sketch/ui'
import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import { isSketchSupportedVersion } from './common'

const webviewIdentifier = 'sketch-dark-mode.webview'
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors.length > 0 ? doc.colors : []
const settingsKey = `${doc.id}-dark-theme-colors`
const savedDarkThemeColors =
  Settings.settingForKey(settingsKey) ||
  Settings.documentSettingForKey(doc, settingsKey)
const libraries = sketch.getLibraries()
const mappedLibraries = []

libraries.forEach(library => {
  try {
    const libDocument = library.getDocument()
    mappedLibraries.push({
      type: library.type,
      id: library.id,
      name: library.name,
      valid: library.valid,
      enabled: library.enabled,
      colors: libDocument.colors
    })
  } catch (error) {
    console.log(error)
  }
})

const closeWwebView = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  closeWwebView()
}

export default () => {
  if (!isSketchSupportedVersion()) {
    UI.message('⚠️ This plugin only works on Sketch 54 or above.')
    return
  }

  const windowOptions = {
    identifier: webviewIdentifier,
    parent: doc,
    width: 500,
    minWidth: 500,
    maxWidth: 500,
    height: 760,
    minHeight: 480,
    maxHeight: 980,
    titleBarStyle: 'hidden',
    show: false,
    fullscreenable: false,
    hidesOnDeactivate: false,
    remembersWindowFrame: true,
    webPreferences: {
      devTools: true
    }
  }

  const browserWindow = new BrowserWindow(windowOptions)

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  const webContents = browserWindow.webContents

  webContents.on('externalLinkClicked', (url) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
  })

  webContents.on('closeWindow', () => {
    closeWwebView()
  })

  webContents.on('saveDarkThemePalette', (darkThemeColors) => {
    Settings.setSettingForKey(settingsKey, darkThemeColors)
    Settings.setDocumentSettingForKey(doc, settingsKey, darkThemeColors)

    if (darkThemeColors && darkThemeColors.length > 0) {
      UI.message('🎉 The color palette has been successfully saved!')
    } else {
      UI.message('🙃 Note that you just saved an empty color palette.')
    }

    closeWwebView()
  })

  webContents.executeJavaScript(
    `createPaletteUI(
      ${JSON.stringify(documentColors)},
      ${JSON.stringify(savedDarkThemeColors)},
      ${JSON.stringify(mappedLibraries)}
    )`
  )
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.log(error)
    })

  browserWindow.loadURL(require('../resources/webview.html'))
}
