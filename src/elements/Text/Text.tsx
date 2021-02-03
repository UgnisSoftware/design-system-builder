import { themeGet } from '@styled-system/theme-get'
import styled, { css } from 'styled-components'
import { color, ColorProps, compose, ResponsiveValue, style, typography, TypographyProps, variant } from 'styled-system'
import type { Color, themeProps } from '../../Theme'
import { Box, boxMixin, BoxProps } from '../Box/Box'
import { TEXT_VARIANTS, TextVariant } from './tokens'

export type BaseTextProps = TypographyProps<typeof themeProps> &
  ColorProps<typeof themeProps> & {
    variant?: ResponsiveValue<TextVariant>
    textColor?: ResponsiveValue<Color>
  }

const textColor = style({
  prop: 'textColor',
  cssProperty: 'color',
  key: 'colors',
})

export const textMixin = compose(typography, color, textColor)

export const overflowEllipsisMixin = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export type TextProps = BaseTextProps & BoxProps & { overflowEllipsis?: boolean }

export const Text = styled(Box)<TextProps>`
  ${variant({ variants: TEXT_VARIANTS.small })}
  ${textMixin}

  @media (min-width: ${themeGet('breakpoints.0')}) {
    ${variant({ variants: TEXT_VARIANTS.large })}
    ${textMixin}
    ${boxMixin}
  }

  ${({ overflowEllipsis }) => overflowEllipsis && overflowEllipsisMixin}
`

Text.displayName = 'Text'

Text.defaultProps = {
  fontFamily: 'sans',
  variant: 'body',
}
