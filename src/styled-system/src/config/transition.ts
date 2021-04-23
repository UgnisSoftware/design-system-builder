import type * as CSS from "csstype"
import type { Config } from "../prop-config"
import type { ResponsiveValue } from "../utils"

export const transition: Config = {
  transition: true,
  transitionDuration: {
    property: "transitionDuration",
    scale: "transition.duration",
  },
  transitionProperty: {
    property: "transitionProperty",
    scale: "transition.property",
  },
  transitionTimingFunction: {
    property: "transitionTimingFunction",
    scale: "transition.easing",
  },
}

export interface TransitionProps {
  /**
   * The CSS `transition` property
   */
  transition?: ResponsiveValue<CSS.Property.Transition>
  /**
   * The CSS `transition-property` property
   */
  transitionProperty?: ResponsiveValue<CSS.Property.TransitionProperty>
  /**
   * The CSS `transition-timing-function` property
   */
  transitionTimingFunction?: ResponsiveValue<CSS.Property.TransitionTimingFunction>
  /**
   * The CSS `transition-duration` property
   */
  transitionDuration?: ResponsiveValue<string>
}
