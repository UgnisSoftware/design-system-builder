import Input from "./input"

type Dict = Record<string, any>

const baseStyle = {
  ...Input.baseStyle.field,
  textAlign: "center",
}

const sizes = {
  lg: {
    fontSize: "lg",
    w: 12,
    h: 12,
    borderRadius: "md",
  },
  md: {
    fontSize: "md",
    w: 10,
    h: 10,
    borderRadius: "md",
  },
  sm: {
    fontSize: "sm",
    w: 8,
    h: 8,
    borderRadius: "sm",
  },
  xs: {
    fontSize: "xs",
    w: 6,
    h: 6,
    borderRadius: "sm",
  },
}

const variants = {
  outline: Input.variants.outline.field,
  unstyled: Input.variants.unstyled.field,
}

const defaultProps = Input.defaultProps

export default {
  baseStyle,
  sizes,
  variants,
  defaultProps,
}
