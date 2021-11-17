const parts = ["wrapper", "navItem"]

const baseStyle = {
  wrapper: {
    spaceX: "2.5rem",
    display: "inline-flex",
  },
  navItem: {
    fontSize: "lg",
    cursor: "pointer",
    color: "neutral.400",
    transition: "color 100ms",
    _hover: {
      color: "neutral.600",
    },
    _active: {
      color: "neutral.700",
    },
    _disabled: {
      cursor: "not-allowed",
      color: "neutral.300",
    },
    _selected: {
      color: "primary.600",
      fontWeight: "600",
    },
  },
}
export default {
  baseStyle,
  parts,
}
