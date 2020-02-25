import sketch from 'sketch/dom'
import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'

const webviewIdentifier = 'sketch-dark-mode.webview'
const doc = sketch.getSelectedDocument()
const documentColors = doc.colors.length > 0 ? doc.colors : []

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}

export default () => {
  const windowOptions = {
    identifier: webviewIdentifier,
    width: 460,
    minWidth: 460,
    maxWidth: 460,
    height: 740,
    minHeight: 460,
    maxHeight: 960,
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

  webContents.executeJavaScript(
    `createPaletteUI(${JSON.stringify(documentColors)})`
  )
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.log(error)
    })

  browserWindow.loadURL(require('../resources/webview.html'))
}
