import 'styled-components'
import { Theme } from '../src/Theme'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
