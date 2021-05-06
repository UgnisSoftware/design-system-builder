import theme, { ChakraTheme } from "../src"

describe("Theme", () => {
  it("should be a ChakraTheme", () => {
    // Check if default theme is of type ChakraTheme
    const defaultThemeIsAChakraTheme = theme as ChakraTheme
    expect(defaultThemeIsAChakraTheme).toBeTruthy()
  })
})
