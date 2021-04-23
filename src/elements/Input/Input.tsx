// import * as React from "react"
// import type { ThemingProps } from "../../system/types"
// import { useMultiStyleConfig } from "../../system/use-style-config"
// import { Primitive } from "../../system/Primitive"
//
// type Omitted = "disabled" | "required" | "readOnly" | "size"
//
// export interface InputProps
//   extends Omit<HTMLChakraProps<"input">, Omitted>,
//     ThemingProps<"Input">,
//     FormControlOptions {}
//
// export const Input = React.forwardRef<InputProps, "input">((props, ref) => {
//   const styles = useMultiStyleConfig("Input", props)
//   const ownProps = omitThemingProps(props)
//   const input = useFormControl<HTMLInputElement>(ownProps)
//
//   return <Primitive.input {...input} ref={ref} />
// })
