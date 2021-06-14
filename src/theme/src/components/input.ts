const parts = ["field", "addon", "errorMessage", "label", "requiredIndicator"]

const baseStyle = {
  field: {
    width: "100%",
    minWidth: 0,
    outline: 0,
    position: "relative",
    appearance: "none",
    transition: "all 0.2s",
    borderRadius: "base",
  },
  errorMessage: {
    bg: "red.600",
    px: 1,
    py: 0.5,
    borderRadius: "base",
    border: "1px solid",
    mt: 0.25,
    borderColor: "red.600",
    color: "white",
    fontSize: "xs",
    lineHeight: "0.75rem",
  },
  label: {
    color: "neutral.800",
    mb: 0.25,
    fontSize: "xs",
    lineHeight: "0.75rem",
  },
  requiredIndicator: {
    ml: "1px",
    color: "error.700",
    fontSize: "sm",
    lineHeight: 0,
  },
}

const size = {
  lg: {
    fontSize: "lg",
    px: 1,
    h: 5,
  },

  md: {
    fontSize: "md",
    px: 1,
    h: "2.5rem",
  },

  sm: {
    fontSize: "sm",
    px: 3,
    h: 2,
  },

  xs: {
    fontSize: "xs",
    px: 2,
    h: 1,
    borderRadius: "base",
  },
}

const sizes = {
  lg: {
    field: size.lg,
    addon: size.lg,
  },
  md: {
    field: size.md,
    addon: size.md,
  },
  sm: {
    field: size.sm,
    addon: size.sm,
  },
  xs: {
    field: size.xs,
    addon: size.xs,
  },
}

const variantOutline = {
  field: {
    color: "neutral.800",
    border: "1px solid",
    borderColor: "neutral.200",
    bg: "inherit",
    _hover: {
      borderColor: "neutral.400",
    },
    _readOnly: {
      userSelect: "all",
    },
    _disabled: {
      cursor: "not-allowed",
      _hover: {
        borderColor: "neutral.200",
      },
    },
    _invalid: {
      borderColor: "error.600",
    },
    _focus: {
      borderColor: "primary.500",
    },
  },
  addon: {
    border: "1px solid",
    borderColor: "neutral.200",
    bg: "neutral.100",
  },
}

const variantUnstyled = {
  field: {
    bg: "transparent",
    pl: 0,
    pr: 0,
    height: "auto",
  },
  addon: {
    bg: "transparent",
    pl: 0,
    pr: 0,
    height: "auto",
  },
}

const variants = {
  outline: variantOutline,
  unstyled: variantUnstyled,
}

const defaultProps = {
  size: "md",
  variant: "outline",
}

export default {
  parts,
  baseStyle,
  sizes,
  variants,
  defaultProps,
}
