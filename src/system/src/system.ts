import _styled, { CSSObject, FunctionInterpolation } from "@emotion/styled"
import { shouldForwardProp } from "./should-forward-prop"
import type { As, ChakraComponent, ChakraProps, PropsOf } from "./system.types"
import { domElements, DOMElements } from "./system.utils"
import { objectFilter } from "../../utils"
import { StyleProps, SystemStyleObject, css, isStyleProp } from "../../styled-system"

type StyleResolverProps = SystemStyleObject & {
  __css?: SystemStyleObject
  sx?: SystemStyleObject
  theme: any
  css?: CSSObject
}

interface GetStyleObject {
  (options: { baseStyle?: SystemStyleObject }): FunctionInterpolation<StyleResolverProps>
}

/**
 * Style resolver function that manages how style props are merged
 * in combination with other possible ways of defining styles.
 *
 * For example, take a component defined this way:
 * ```jsx
 * <Box fontSize="24px" sx={{ fontSize: "40px" }}></Box>
 * ```
 *
 * We want to manage the priority of the styles properly to prevent unwanted
 * behaviors. Right now, the `sx` prop has the highest priority so the resolved
 * fontSize will be `40px`
 */
export const toCSSObject: GetStyleObject =
  ({ baseStyle }) =>
  (props) => {
    const { theme, css: cssProp, __css, sx, ...rest } = props
    const styleProps = objectFilter(rest, (_, prop) => isStyleProp(prop))
    const finalStyles = Object.assign({}, __css, baseStyle, styleProps, sx)
    const computedCSS = css(finalStyles)(props.theme)
    return cssProp ? [computedCSS, cssProp] : computedCSS
  }

interface StyledOptions {
  shouldForwardProp?(prop: string): boolean
  label?: string
  baseStyle?: SystemStyleObject
}

export function styled<T extends As, P = {}>(component: T, options?: StyledOptions) {
  const { baseStyle, ...styledOptions } = options ?? {}

  if (!styledOptions.shouldForwardProp) {
    styledOptions.shouldForwardProp = shouldForwardProp
  }

  const styleObject = toCSSObject({ baseStyle })
  return _styled(component as React.ComponentType<any>, styledOptions)(styleObject) as ChakraComponent<T, P>
}

export type HTMLChakraComponents = {
  [Tag in DOMElements]: ChakraComponent<Tag, {}>
}

export type HTMLChakraProps<T extends As> = Omit<
  PropsOf<T>,
  T extends "svg" ? "ref" | "children" | keyof StyleProps : "ref" | keyof StyleProps
> &
  ChakraProps & { as?: As }

type ChakraFactory = {
  <T extends As, P = {}>(component: T, options?: StyledOptions): ChakraComponent<T, P>
}

export const chakra = styled as unknown as ChakraFactory & HTMLChakraComponents

domElements.forEach((tag) => {
  chakra[tag] = chakra(tag)
})
