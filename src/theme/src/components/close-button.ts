const baseStyle = {
  borderRadius: "md",
  transition: "all 0.2s",
  color: "neutral.800",
  _disabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  _hover: { color: "neutral.900" },
  _active: { color: "neutral.900" },
}

const sizes = {
  lg: {
    w: "40px",
    h: "40px",
    fontSize: "16px",
  },
  md: {
    w: "32px",
    h: "32px",
    fontSize: "12px",
  },
  sm: {
    w: "24px",
    h: "24px",
    fontSize: "10px",
  },
}

const defaultProps = {
  size: "sm",
}

export default {
  baseStyle,
  sizes,
  defaultProps,
}
