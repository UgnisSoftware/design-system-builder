import Modal from "./modal"

const parts = Modal.parts

function getSize(value: string) {
  if (value === "full") {
    return { dialog: { maxW: "100vw", h: "100vh" } }
  }
  return { dialog: { maxW: value } }
}

const baseStyleOverlay = {
  bg: "blackAlpha.600",
  zIndex: "overlay",
}

const baseStyleDialogContainer = {
  display: "flex",
  zIndex: "modal",
  justifyContent: "center",
}

const baseStyleDialog = {
  zIndex: "modal",
  maxH: "100vh",
  bg: "white",
  color: "inherit",
  boxShadow: "lg",
}

const baseStyleHeader = {
  px: 6,
  py: 4,
  fontSize: "xl",
  fontWeight: "semibold",
}

const baseStyleCloseButton = {
  position: "absolute",
  top: 2,
  insetEnd: 3,
}

const baseStyleBody = {
  px: 6,
  py: 2,
  flex: 1,
  overflow: "auto",
}

const baseStyleFooter = {
  px: 6,
  py: 4,
}

const baseStyle = {
  overlay: baseStyleOverlay,
  dialogContainer: baseStyleDialogContainer,
  dialog: baseStyleDialog,
  header: baseStyleHeader,
  closeButton: baseStyleCloseButton,
  body: baseStyleBody,
  footer: baseStyleFooter,
}

const sizes = {
  "2xs": getSize("2xs"),
  xs: getSize("xs"),
  sm: getSize("md"),
  md: getSize("lg"),
  lg: getSize("2xl"),
  xl: getSize("4xl"),
  full: getSize("full"),
}

const defaultProps = {
  size: "xs",
}

export default {
  parts,
  baseStyle,
  sizes,
  defaultProps,
}
