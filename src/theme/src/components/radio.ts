const parts = ["container", "control", "label"]

const control = {
  borderRadius: "full",
  w: "100%",
  border: "2px solid",
  color: "primary.500",
  borderColor: "currentColor",
  _disabled: {
    color: "neutral.300",
    _hover: {
      color: "neutral.300",
    },
  },
  _focus: {
    color: "primary.600",
  },
  _invalid: {
    color: "warning.500",
  },
  _hover: {
    color: "primary.400",
  },
  _checked: {
    _before: {
      content: `""`,
      display: "inline-block",
      pos: "relative",
      w: "50%",
      h: "50%",
      borderRadius: "50%",
      bg: "currentColor",
    },
  },
}

const label = {
  userSelect: "none",
  _disabled: { color: "neutral.300" },
}

const baseStyle = {
  label,
  control,
}

const sizes = {
  sm: {
    control: { width: 2.5, height: 2.5 },
    label: { fontSize: "md" },
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
