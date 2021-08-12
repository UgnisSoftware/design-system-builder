import type { ButtonProps } from "../../../components/Button"

const baseStyle = {
  borderRadius: "md",
  fontWeight: "semibold",
  _disabled: {
    cursor: "not-allowed",
    boxShadow: "none",
  },
}

const primary = ({ isLoading, disabled }: ButtonProps) => {
  const styles = {
    color: "white",
    bg: "primary.500",
    _hover: {
      bg: "primary.400",
    },
    _active: {
      bg: "primary.600",
    },
    _disabled: {
      bg: "neutral.200",
      color: "neutral.50",
      _hover: {
        bg: "neutral.200",
      },
    },
  }
  if (isLoading && !disabled) {
    return {
      ...styles,
      _disabled: {
        ...styles._disabled,
        bg: "primary.500",
        _hover: {
          bg: "primary.500",
        },
      },
    }
  }
  return styles
}

const secondary = ({ isLoading, disabled }: ButtonProps) => {
  const styles = {
    color: "neutral.800",
    bg: "neutral.100",
    _hover: {
      bg: "neutral.50",
    },
    _active: {
      bg: "neutral.200",
    },
    _disabled: {
      bg: "neutral.200",
      color: "neutral.50",
      _hover: {
        bg: "neutral.200",
      },
    },
  }
  if (isLoading && !disabled) {
    return {
      ...styles,
      _disabled: {
        ...styles._disabled,
        bg: "neutral.100",
        color: "neutral.800",
        _hover: {
          bg: "neutral.100",
        },
      },
    }
  }
  return styles
}

const outline = ({ isLoading, disabled }: ButtonProps) => {
  const styles = {
    color: "neutral.800",
    border: "1px",
    borderColor: "primary.300",
    _hover: {
      borderColor: "primary.200",
    },
    _active: {
      borderColor: "primary.400",
    },
    _disabled: {
      borderColor: "neutral.200",
      color: "neutral.300",
      _hover: {
        borderColor: "neutral.200",
      },
    },
  }
  if (isLoading && !disabled) {
    return {
      ...styles,
      _disabled: {
        ...styles._disabled,
        borderColor: "primary.300",
        color: "neutral.800",
        _hover: {
          borderColor: "primary.200",
        },
      },
    }
  }
  return styles
}

const text = ({ isLoading, disabled }: ButtonProps) => {
  const styles = {
    p: 0,
    color: "neutral.800",
    _hover: {
      color: "neutral.900",
    },
    _active: {
      color: "neutral.700",
    },
    _disabled: {
      color: "neutral.300",
      _hover: {
        borderColor: "neutral.300",
      },
    },
  }
  if (isLoading && !disabled) {
    return {
      ...styles,
      _disabled: {
        ...styles._disabled,
        color: "neutral.800",
        _hover: {
          color: "neutral.800",
        },
      },
    }
  }
  return styles
}

const variants = {
  primary,
  secondary,
  outline,
  text,
}

const sizes = {
  md: {
    py: 1,
    px: 2,
    fontSize: "sm",
    lineHeight: "none",
    minH: "2.375rem",
    minW: "2.375rem",
  },
  sm: {
    py: 0.5,
    px: 1,
    fontSize: "xs",
    lineHeight: "none",
    minH: "1.75rem",
    minW: "1.75rem",
  },
}

const defaultProps = {
  variant: "primary",
  size: "md",
}

export default {
  baseStyle,
  variants,
  sizes,
  defaultProps,
}
