import type { ButtonProps } from "../../../components/Button"

const baseStyle = {
  borderRadius: "md",
  h: "fit-content",
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
      bg: "primary.600",
    },
    _active: {
      bg: "primary.700",
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
      bg: "neutral.200",
    },
    _active: {
      bg: "neutral.300",
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
      borderColor: "primary.400",
    },
    _active: {
      borderColor: "primary.500",
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

const outlineError = ({ isLoading, disabled }: ButtonProps) => {
  const styles = {
    color: "neutral.800",
    border: "1px",
    borderColor: "error.200",
    _hover: {
      borderColor: "error.300",
    },
    _active: {
      borderColor: "error.400",
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
    h: "auto",
    color: "neutral.800",
    _hover: {
      color: "neutral.900",
    },
    _active: {
      color: "neutral.900",
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
  outlineError,
  text,
}

const sizes = {
  md: {
    h: "2.5rem",
    px: 2,
    fontSize: "sm",
    lineHeight: "none",
    minW: "2.375rem",
  },
  sm: {
    h: "1.75rem",
    px: 1,
    fontSize: "xs",
    lineHeight: "none",
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
