export const isValidColor = (value) => {
  return /^#[0-9A-F]{6}$/i.test(value)
}

export const getRegularHexValue = (value) => {
  return value.slice(0, -2)
}
