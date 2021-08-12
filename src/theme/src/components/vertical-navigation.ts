import Drawer from "./drawer"

const parts = [...Drawer.parts, "list", "listItem"]

const baseStyle = {
  ...Drawer.baseStyle,
  dialog: {
    ...Drawer.baseStyle.dialog,
    boxShadow: "none",
    overflow: "auto",
  },
  listItem: {
    px: "2rem",
    py: "0.6rem",
    fontSize: "sm",
    cursor: "pointer",
    _hover: {
      bg: "neutral.50",
    },
  },
}
export default {
  ...Drawer,
  baseStyle,
  parts,
}
