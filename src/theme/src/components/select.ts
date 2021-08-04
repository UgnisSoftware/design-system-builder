import Input from "./input"

const parts = ["field", "icon", "iconBox", "clearIcon", "selectIcon", "dropdown", "dropdownItem"]

const baseStyleField = {
  appearance: "none",
  paddingBottom: "1px",
  lineHeight: "normal",
  width: "100%",
  position: "relative",
  fontSize: "md",
  px: 1,
  h: "2.5rem",
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
  cursor: "pointer",
  _disabled: {
    cursor: "not-allowed",
  },
}

const baseStyleClearIcon = {
  fontSize: "lg",
  color: "neutral.500",
  cursor: "pointer",
  _disabled: {
    cursor: "not-allowed",
  },
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
