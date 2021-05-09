const parts = ["container", "control", "label", "icon"]

const control = {
  w: "100%",
  transition: "box-shadow 250ms",
  border: "2px solid",
  borderRadius: "sm",
  borderColor: "primary.500",
  color: "white",

  _checked: {
    bg: "primary.500",
    borderColor: "primary.500",
    color: "white",

    _hover: {
      bg: "primary.400",
      borderColor: "primary.400",
    },

    _disabled: {
      borderColor: "neutral.300",
      bg: "neutral.300",
      color: "white",
    },
  },

  _disabled: {
    borderColor: "neutral.300",
  },

  _invalid: {
    borderColor: "error.500",
  },

  _indeterminate: {
    bg: "primary.500",
  },
}

const label = {
  userSelect: "none",
  _disabled: { color: "neutral.300" },
}

const baseStyle = {
  control,
  label,
}

const sizes = {
  sm: {
    control: { h: "1.125rem", w: "1.125rem" },
    label: { fontSize: "md" },
    icon: { fontSize: "0.6rem" },
  },
}

const defaultProps = {
  size: "sm",
}

export default {
  parts,
  baseStyle,
  sizes,
  defaultProps,
}
