import "@emotion/react"
import { Theme as DefaultTheme } from "../theme/theme"

declare module "@emotion/react" {
  export interface Theme extends DefaultTheme {}
}
