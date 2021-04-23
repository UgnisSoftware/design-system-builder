import type * as CSS from "csstype"
import type { Config } from "../prop-config"
import { t, Token } from "../utils"
import { isCssVar, isNumber } from "../../../utils"

const templates = {
  auto: "var(--chakra-transform)",
  "auto-gpu": "var(--chakra-transform-gpu)",
} as const

const degreeTransform = (value: any) => {
  if (isCssVar(value) || value == null) return value
  return isNumber(value) ? `${value}deg` : value
}

type TransformValue = keyof typeof templates

export const transform: Config = {
  transform: {
    property: "transform",
    transform(value?: TransformValue) {
      if (value !== undefined) {
        return templates[value] ?? value
      }
    },
  },
  transformOrigin: true,
  translateX: t.spaceT("--chakra-translate-x"),
  translateY: t.spaceT("--chakra-translate-y"),
  rotateX: {
    property: "--chakra-rotate-x",
    transform: degreeTransform,
  },
  rotateY: {
    property: "--chakra-rotate-y",
    transform: degreeTransform,
  },
  skewX: {
    property: "--chakra-skew-x",
    transform: degreeTransform,
  },
  skewY: {
    property: "--chakra-skew-y",
    transform: degreeTransform,
  },
}

export interface TransformProps {
  /**
   * The CSS `transform` property
   */
  transform?: Token<CSS.Property.Transform | keyof typeof templates>
  /**
   * The CSS `transform-origin` property
   */
  transformOrigin?: Token<CSS.Property.TransformOrigin | number, "sizes">
}
