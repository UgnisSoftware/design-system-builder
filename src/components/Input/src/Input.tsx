import { Conditional } from "~/components/Conditional"
import * as React from "react"
import { InputCore, InputCoreProps } from "~/components/Input"
import { InputError } from "~/components/Input/src/InputError"
import { useFormControl } from "~/form-control"
import { InputLabel } from "~/components/Input/src/InputLabel"
import { forwardRef } from "~/system"

export type InputProps = InputCoreProps & {
  error?: string
  label?: string
}

export const Input = forwardRef((props: InputProps, ref) => {
  const input = useFormControl<HTMLInputElement>(props)

  return (
    <Conditional
      condition={!!props.label}
      wrap={(children) => (
        <InputLabel label={props.label!} isRequired={props.isRequired}>
          {children}
        </InputLabel>
      )}
    >
      <>
        <InputCore {...input} isInvalid={!!input.error} ref={ref} />
        <InputError error={input.error} />
      </>
    </Conditional>
  )
})
