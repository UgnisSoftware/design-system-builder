import Input from "./input"

const parts = ["field", "icon", "iconBox", "clearIcon", "selectIcon", "dropdown", "dropdownItem"]

const baseStyleField = {
  ...Input.baseStyle.field,
  appearance: "none",
  paddingBottom: "1px",
  lineHeight: "normal",
  width: "100%",
  height: "fit-content",
  position: "relative",
}

const baseStyleIcon = {
  position: "relative",
  color: "currentColor",
  fontSize: "1.25rem",
  pointerEvents: "none",
}

const baseStyleIconBox = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  top: "50%",
  transform: "translate(0%,-50%)",
  right: "1rem",
}

const baseStyleSelectIcon = {
  fontSize: "xl",
  color: "neutral.500",
  pointerEvents: "none",
}

const baseStyleClearIcon = {
  fontSize: "lg",
  color: "neutral.500",
  cursor: "pointer",
}

const baseDropdown = {
  zIndex: "dropdown",
  borderRadius: "base",
  border: "1px solid",
  borderColor: "neutral.200",
  bg: "white",
  py: 0.5,
  boxShadow: "sm",
}

const dropdownItem = {
  px: 1,
}

const baseStyle = {
  field: baseStyleField,
  icon: baseStyleIcon,
  iconBox: baseStyleIconBox,
  clearIcon: baseStyleClearIcon,
  selectIcon: baseStyleSelectIcon,
  dropdown: baseDropdown,
  dropdownItem: dropdownItem,
}

export default {
  parts,
  baseStyle,
  variants: Input.variants,
  defaultProps: Input.defaultProps,
}
