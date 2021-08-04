import { FormControlOptions, useFormControl } from "~/form-control"
import { chakra, forwardRef, omitThemingProps, ThemingProps, useMultiStyleConfig, HTMLChakraProps } from "~/system"
import { __DEV__ } from "~/utils"

type Omitted = "disabled" | "required" | "readOnly" | "size"

export interface InputCoreProps
  extends Omit<HTMLChakraProps<"input">, Omitted>,
    ThemingProps<"Input">,
    FormControlOptions {}

/**
 * Input
 *
 * Element that allows users enter single valued data.
 */
export const InputCore = forwardRef<InputCoreProps, "input">((props, ref) => {
  const styles = useMultiStyleConfig("Input", props)
  const ownProps = omitThemingProps(props)
  const input = useFormControl<HTMLInputElement>(ownProps)
  const { className, __css } = props
  return <chakra.input {...input} __css={{ ...styles.field, ...__css }} ref={ref} className={className} />
})

if (__DEV__) {
  InputCore.displayName = "Input"
}

// This is used in `input-group.tsx`
InputCore.id = "Input"
