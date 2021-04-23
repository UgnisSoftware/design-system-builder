import type * as CSS from "csstype"
import type { Config } from "../prop-config"
import { t, Token } from "../utils"

export const shadow: Config = {
  boxShadow: t.shadows("boxShadow"),
  textShadow: t.shadows("textShadow"),
}

Object.assign(shadow, {
  shadow: shadow.boxShadow,
})

/**
 * Types for box and text shadow properties
 */
export interface ShadowProps {
  /**
   * The `box-shadow` property
   */
  boxShadow?: Token<CSS.Property.BoxShadow | number, "shadows">
  /**
   * The `box-shadow` property
   */
  shadow?: Token<CSS.Property.BoxShadow | number, "shadows">
  /**
   * The `text-shadow` property
   */
  textShadow?: Token<CSS.Property.TextShadow | number, "shadows">
}
