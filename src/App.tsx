import React from 'react'
import { ThemeProvider } from 'styled-components'

import { themeProps } from './theme'
import { Text } from './elements/Text/Text'
import { GlobalStyle } from './helpers/GlobalStyle'

export const App = () => {
  return (
    <ThemeProvider theme={themeProps}>
      <GlobalStyle />
      <Text variant="h1" textColor="primary900">
        Ugnis
      </Text>
    </ThemeProvider>
  )
}

export default App
