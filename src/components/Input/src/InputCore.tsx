import React, { ForwardedRef } from "react"
import { useFormControl, UseFormControlProps } from "~/form-control"
import { chakra, omitThemingProps, ThemingProps, useMultiStyleConfig, PropsOf, ChakraProps } from "~/system"
import { __DEV__ } from "~/utils"

type Omitted = "size"

export type InputCoreProps = Omit<PropsOf<"input">, Omitted> &
  ThemingProps<"Input"> &
  UseFormControlProps<HTMLInputElement> &
  ChakraProps & {
    id?: string
  }

export const InputCore = React.forwardRef((props: InputCoreProps, ref: ForwardedRef<any>) => {
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
;(InputCore as any).id = "Input"
