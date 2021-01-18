import React from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '../src/helpers/GlobalStyle'
import { themeProps } from '../src/Theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={themeProps}>
      <GlobalStyle />
      <Story />
    </ThemeProvider>
  ),
]
