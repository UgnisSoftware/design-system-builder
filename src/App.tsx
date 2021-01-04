import React from 'react'
import { ThemeProvider } from 'styled-components'

import { themeProps } from './Theme'

export const App = () => {
  return (
    <ThemeProvider theme={themeProps}>
      <div>Ugnis</div>
    </ThemeProvider>
  )
}

export default App
