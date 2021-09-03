import type { ChangeEventHandler, FocusEventHandler } from "react"
import type { MouseEventHandler, KeyboardEventHandler } from "react"
import { ariaAttr } from "~/utils"

export type UseFormControlProps<T extends HTMLElement> = {
  id?: string
  onFocus?: FocusEventHandler<T>
  onBlur?: FocusEventHandler<T>
  onClick?: MouseEventHandler<T>
  onChange?: ChangeEventHandler<T>
  onKeyDown?: KeyboardEventHandler<any>
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: string
  value?: string | number | readonly string[]
  invalid?: boolean
}

export function useFormControl<T extends HTMLElement>(props: UseFormControlProps<T>) {
  const { id, disabled, readOnly, required, onFocus, onBlur, error, value, invalid, onChange, onClick, onKeyDown } =
    props

  return {
    disabled,
    readOnly,
    required,
    error,
    id,
    value,
    onFocus,
    onBlur,
    onChange,
    onClick,
    onKeyDown,
    "aria-invalid": ariaAttr(invalid ?? !!error),
  }
}
