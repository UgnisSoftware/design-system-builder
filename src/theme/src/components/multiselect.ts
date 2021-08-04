import Input from "./input"
import type { Dict } from "~/utils"

const parts = ["field", "input", "icon", "iconBox", "clearIcon", "selectIcon", "dropdown", "dropdownItem"]

const baseStyleField = (props: Dict) => {
  return {
    ...Input.baseStyle.field,
    appearance: "none",
    paddingBottom: "1px",
    lineHeight: "normal",
    width: "100%",
    height: "fit-content",
    position: "relative",
    fontSize: "md",
    pl: 1,
    pr: "3.5rem",
    py: "0.5rem",
    minHeight: "2.5rem",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    _focusWithin: {
      borderColor: "primary.500",
    },
  }
}

const baseStyleInput = {
  outline: 0,
  width: 0,
  flexGrow: 1,
  minWidth: "2rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  _disabled: {
    cursor: "not-allowed",
  },
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

const baseStyle = (props: Dict) => ({
  field: baseStyleField(props),
  input: baseStyleInput,
  icon: baseStyleIcon,
  iconBox: baseStyleIconBox,
  clearIcon: baseStyleClearIcon,
  selectIcon: baseStyleSelectIcon,
  dropdown: baseDropdown,
  dropdownItem: dropdownItem,
})

const variants = {
  outline: {
    ...Input.variants.outline,
    field: {
      ...Input.variants.outline.field,
      _focusWithin: {
        borderColor: "primary.500",
        _hover: {
          borderColor: "primary.500",
        },
        _invalid: {
          borderColor: "error.500",
        },
      },
    },
  },
}
export default {
  parts,
  baseStyle,
  variants,
  defaultProps: Input.defaultProps,
}
