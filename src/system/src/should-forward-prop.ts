import { propNames } from "../../styled-system"

/**
 * List of props for emotion to omit from DOM.
 * It mostly consists of Chakra props
 */

export const systemProps = [
  "textStyle",
  "layerStyle",
  "apply",
  "isTruncated",
  "noOfLines",
  "focusBorderColor",
  "errorBorderColor",
  "as",
  "__css",
  "css",
  "sx",
]
export const HTMLprops = ["htmlWidth", "htmlHeight", "htmlSize"]

const allPropNames = new Set([...propNames, ...systemProps])

/**
 * htmlWidth and htmlHeight is used in the <Image />
 * component to support the native `width` and `height` attributes
 *
 * https://github.com/chakra-ui/chakra-ui/issues/149
 */
const validHTMLProps = new Set(HTMLprops)

export const shouldForwardProp = (prop: string): boolean => validHTMLProps.has(prop) || !allPropNames.has(prop)
