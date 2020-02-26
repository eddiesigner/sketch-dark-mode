import sketch from 'sketch/dom'
import Settings from 'sketch/settings'
import UI from 'sketch/ui'
import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'

const webviewIdentifier = 'sketch-dark-mode.webview'
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors.length > 0 ? doc.colors : []
const savedDarkThemeColors = Settings.settingForKey(`${doc.id}-dark-theme-colors`)

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
  const windowOptions = {
    identifier: webviewIdentifier,
    width: 480,
    minWidth: 480,
    maxWidth: 480,
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
    if (darkThemeColors && darkThemeColors.length > 0) {
      Settings.setSettingForKey(`${doc.id}-dark-theme-colors`, darkThemeColors)
      UI.message('🎉 The color palette has been successfully saved!')
    }

    closeWwebView()
  })

  webContents.executeJavaScript(
    `createPaletteUI(
      ${JSON.stringify(documentColors)},
      ${JSON.stringify(savedDarkThemeColors)}
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
