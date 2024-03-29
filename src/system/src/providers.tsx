import { createContext } from "../../react-utils"
import { useColorMode } from "../../color-mode"
import {
  Global,
  Interpolation,
  ThemeContext,
  ThemeProvider as EmotionThemeProvider,
  ThemeProviderProps as EmotionThemeProviderProps,
} from "@emotion/react"
import * as React from "react"
import { css, SystemStyleObject, toCSSVar, WithCSSVar } from "../../styled-system"
import { Dict, memoizedGet as get, runIfFn } from "../../utils"

export interface ThemeProviderProps extends EmotionThemeProviderProps {
  /**
   * The element to attach the CSS custom properties to.
   * @default ":root"
   */
  cssVarsRoot?: string
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { cssVarsRoot = ":root", theme, children } = props
  const computedTheme = React.useMemo(() => toCSSVar(theme), [theme])
  return (
    <EmotionThemeProvider theme={computedTheme}>
      <Global styles={(theme: any) => ({ [cssVarsRoot]: theme.__cssVars })} />
      {children}
    </EmotionThemeProvider>
  )
}

export function useTheme<T extends object = Dict>() {
  const theme = React.useContext(ThemeContext as unknown as React.Context<T | undefined>)
  if (!theme) {
    throw Error(
      "useTheme: `theme` is undefined. Seems you forgot to wrap your app in `<ChakraProvider />` or `<ThemeProvider />`",
    )
  }

  return theme as WithCSSVar<T>
}

const [StylesProvider, useStyles] = createContext<Dict<SystemStyleObject>>({
  name: "StylesContext",
  errorMessage: "useStyles: `styles` is undefined. Seems you forgot to wrap the Row in `<StylesProvider />` ",
})
export { StylesProvider, useStyles }

/**
 * Applies styles defined in `theme.styles.global` globally
 * using emotion's `Global` component
 */
export const GlobalStyle = () => {
  const { colorMode } = useColorMode()
  return (
    <Global
      styles={(theme: any) => {
        const styleObjectOrFn = get(theme, "styles.global")
        const globalStyles = runIfFn(styleObjectOrFn, { theme, colorMode })
        if (!globalStyles) return undefined
        const styles = css(globalStyles)(theme)
        return styles as Interpolation<{}>
      }}
    />
  )
}
