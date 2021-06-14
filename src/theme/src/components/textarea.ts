import Input from "./input"

const baseStyle = {
  ...Input.baseStyle.field,
  paddingY: "8px",
  minHeight: "80px",
  lineHeight: "short",
}

const variants = {
  outline: Input.variants.outline.field,
  unstyled: Input.variants.unstyled.field,
}

const sizes = {
  xs: Input.sizes.xs.field,
  sm: Input.sizes.sm.field,
  md: Input.sizes.md.field,
  lg: Input.sizes.lg.field,
}

const defaultProps = {
  size: "md",
  variant: "outline",
}

export default {
  baseStyle,
  sizes,
  variants,
  defaultProps,
}
