import { themeGet } from '@styled-system/theme-get'
import styled, { css } from 'styled-components'
import { color, ColorProps, compose, ResponsiveValue, style, typography, TypographyProps, variant } from 'styled-system'
import type { Color, themeProps } from '../../Theme'
import { Box, BoxProps } from '../Box'
import { TEXT_VARIANTS, TextVariant } from './tokens'

/** BaseTextProps */
export type BaseTextProps = TypographyProps &
  ColorProps<typeof themeProps> & {
    variant?: ResponsiveValue<TextVariant>
    textColor?: ResponsiveValue<Color>
  }

const textColor = style({
  prop: 'textColor',
  cssProperty: 'color',
  key: 'colors',
})

/** styled functions for Text */
export const textMixin = compose(typography, color, textColor)

/** Adds ellipsis to overflowing text */
export const overflowEllipsisMixin = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

/** TextProps */
export type TextProps = BaseTextProps & BoxProps & { overflowEllipsis?: boolean }

/** Text */
export const Text = styled(Box)<TextProps>`
  ${variant({ variants: TEXT_VARIANTS.small })}
  ${textMixin}

  @media (min-width: ${themeGet('breakpoints.0')}) {
    ${variant({ variants: TEXT_VARIANTS.large })}
    ${textMixin}
  }

  ${({ overflowEllipsis }) => overflowEllipsis && overflowEllipsisMixin}
`

Text.displayName = 'Text'

Text.defaultProps = {
  fontFamily: 'sans',
  variant: 'body',
}
