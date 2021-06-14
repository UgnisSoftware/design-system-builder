import { mode } from "~/theme-tools"

type Dict = Record<string, any>

const parts = ["requiredIndicator", "helperText"]

function baseStyleRequiredIndicator(props: Dict) {
  return {
    ml: 1,
    color: "error.600",
  }
}

function baseStyleHelperText(props: Dict) {
  return {
    mt: 2,
    color: mode("gray.500", "whiteAlpha.600")(props),
    lineHeight: "normal",
    fontSize: "sm",
  }
}

const baseStyle = (props: Dict) => ({
  requiredIndicator: baseStyleRequiredIndicator(props),
  helperText: baseStyleHelperText(props),
})

export default {
  parts,
  baseStyle,
}
