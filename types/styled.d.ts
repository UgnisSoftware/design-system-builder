import 'styled-components'
import { Theme } from '../src/theme'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
