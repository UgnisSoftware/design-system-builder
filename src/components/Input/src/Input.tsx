import * as React from "react"
import { InputCore, InputCoreProps } from "~/components/Input"
import { InputError } from "~/components/Input/src/InputError"
import { useFormControl } from "~/form-control"
import { Label } from "~/components/Label/src/Label"
import { forwardRef } from "~/system"

export type InputProps = InputCoreProps & {
  error?: string
  label?: string
}

export const Input = forwardRef((props: InputProps, ref) => {
  const input = useFormControl(props)
  const { size, variant } = props
  return (
    <Label text={props.label || ""} isRequired={input.required}>
      <InputCore {...input} ref={ref} size={size} variant={variant} />
      <InputError error={input.error} />
    </Label>
  )
})
