import sketch from 'sketch/dom'
import Settings from 'sketch/settings'
import UI from 'sketch/ui'
import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import {
  getDocumentData,
  isSketchSupportedVersion
} from './utils'

import {
  getRegularHexValue
} from './../resources/utils'

const webviewIdentifier = 'sketch-dark-mode.webview'
const doc = sketch.getSelectedDocument()
const documentData = getDocumentData(doc)
const libraries = sketch.getLibraries()

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
    width: 600,
    minWidth: 600,
    maxWidth: 600,
    height: 820,
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

  webContents.on('saveDarkThemePalette', (schemes) => {

    const colors = []

    for (const [, scheme] of Object.entries(schemes)) {
      scheme.colors.map(color => colors.push(color))
    }

    Settings.setSettingForKey(
      `${doc.id}-dark-mode-colors`,
      Object.fromEntries(colors.map(color => [color.id, color]))
    )
    Settings.setDocumentSettingForKey(
      doc,
      `${doc.id}-dark-mode-colors`,
      Object.fromEntries(colors.map(color => [color.id, color]))
    )

    closeWwebView()
  })

  webContents.executeJavaScript(
    `createPaletteUI(
      ${JSON.stringify({
        ...Object.fromEntries(libraries.filter(library => library.valid).map(library =>
          [library.id, {
            name: library.name,
            enabled: library.enabled,
            colors: library.getImportableSwatchReferencesForDocument(doc).map(swatch => {
              const s = library.getDocument().swatches.find(s => s.name == swatch.name)
              return {
                darkRawColor: '#',
                darkColor: '#',
                darkAlpha: 1,
                isValidColor: false,
                ...(documentData && documentData[swatch.id]),
                id: swatch.id,
                name: swatch.name,
                lightRawColor: s.color,
                lightColor: getRegularHexValue(s.color),
                lightAlpha: s.referencingColor.alpha()
              }
            })
          }]
        )),
        document: {
          name: "Document colors",
          enabled: true,
          colors: doc.swatches.map(swatch => {
            return {
              darkRawColor: '#',
              darkColor: '#',
              darkAlpha: 1,
              isValidColor: true,
              ...(documentData && documentData[swatch.id]),
              id: swatch.id,
              name: swatch.name,
              lightRawColor: swatch.color,
              lightColor: getRegularHexValue(swatch.color),
              lightAlpha: swatch.referencingColor.alpha()
            }
          })
        }
      })}
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
