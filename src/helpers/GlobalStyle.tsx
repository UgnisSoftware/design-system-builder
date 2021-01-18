import reset from 'styled-reset'
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  ${reset}
  *:focus {
   outline: none;
  }
`
