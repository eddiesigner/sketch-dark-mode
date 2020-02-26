export const isSupportedVersion = (version) => {
  if (version >= '53') {
    return true
  }

  return false
}

export const hasFindMethodSupport = (version) => {
  if (version >= '56') {
    return true
  }

  return false
}

export const hasNoColors = (document) => {
  if (document.colors.length === 0) {
    return true
  }

  return false
}

export const hasColorsWithoutName = (documentColors) => {
  let result = false

  for (let i = 0; i < documentColors.length; i++) {
    if (!documentColors[i].name || documentColors[i].name.length === 0) {
      result = true
      break
    }
  }

  return result
}
