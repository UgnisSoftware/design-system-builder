import React from "react"
import { ThemeProvider, Global, css } from "@emotion/react"
import { themeProps } from "../src"
import { CSSReset } from "../src/css-reset"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => (
    <ThemeProvider theme={themeProps}>
      <CSSReset />
      <Global
        styles={css`
          *:focus {
            outline: none;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Nunito", sans-serif;
          }
        `}
      />
      <Story />
    </ThemeProvider>
  ),
]
