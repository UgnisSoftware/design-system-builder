import Badge from "./badge"

const parts = ["container", "label", "closeButton"]

type Dict = Record<string, any>

const baseStyleContainer = {
  fontWeight: "medium",
  lineHeight: 1.2,
  outline: 0,
  borderRadius: "full",
}

const baseStyleLabel = {
  lineHeight: 1.2,
}

const baseStyleCloseButton = {
  fontSize: "18px",
  w: "1.25rem",
  h: "1.25rem",
  borderRadius: "full",
  ms: "0.375rem",
  me: "-1",
  _disabled: {
    cursor: "not-allowed",
  },
}

const baseStyle = {
  container: baseStyleContainer,
  label: baseStyleLabel,
  closeButton: baseStyleCloseButton,
}

const sizes = {
  md: {
    container: {
      minH: "1.5rem",
      minW: "1.5rem",
      fontSize: "sm",
      px: 2,
    },
  },
}

const variants = {
  solid: {
    container: {
      bg: "primary.500",
      color: "white",
      _disabled: {
        bg: "neutral.200",
        cursor: "not-allowed",
      },
    },
  },
}

const defaultProps = {
  size: "md",
  variant: "solid",
}

export default {
  parts,
  variants,
  baseStyle,
  sizes,
  defaultProps,
}
