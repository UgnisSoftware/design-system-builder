import {
  chakra,
  forwardRef,
  layoutPropNames,
  omitThemingProps,
  SystemProps,
  SystemStyleObject,
  ThemingProps,
  useMultiStyleConfig,
  HTMLChakraProps,
} from "../../../system"
import { callAll, split, __DEV__ } from "../../../utils"
import { useRadioGroupContext } from "./Radio-group"
import { useRadio, UseRadioProps } from "./use-radio"

type Omitted = "onChange" | "defaultChecked" | "checked"
interface BaseControlProps extends Omit<HTMLChakraProps<"div">, Omitted> {}

export interface RadioProps extends UseRadioProps, ThemingProps<"Radio">, BaseControlProps {
  /**
   * The spacing between the checkbox and its text text
   * @default 0.5rem
   * @type SystemProps["marginLeft"]
   */
  spacing?: SystemProps["marginLeft"]
}

/**
 * Radio component is used in forms when a user needs to select a single value from
 * several options.
 *
 * @see Docs https://chakra-ui.com/docs/form/radio
 */
export const Radio = forwardRef<RadioProps, "input">((props, ref) => {
  const { onChange: onChangeProp, value: valueProp } = props

  const group = useRadioGroupContext()
  const styles = useMultiStyleConfig("Radio", { ...group, ...props })

  const { spacing = "0.5rem", children, ...rest } = omitThemingProps(props)

  let isChecked = props.isChecked
  if (group?.value != null && valueProp != null) {
    isChecked = group.value === valueProp
  }

  let onChange = onChangeProp
  if (group?.onChange && valueProp != null) {
    onChange = callAll(group.onChange, onChangeProp)
  }

  const name = props?.name ?? group?.name

  const { getInputProps, getCheckboxProps, getLabelProps, htmlProps } = useRadio({
    ...rest,
    isChecked,
    onChange,
    name,
  })

  const [layoutProps, otherProps] = split(htmlProps, layoutPropNames as any)

  const checkboxProps = getCheckboxProps(otherProps)
  const inputProps = getInputProps({}, ref)
  const labelProps = getLabelProps()

  const rootStyles = {
    width: "full",
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "top",
    ...styles.container,
  }

  const checkboxStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...styles.control,
  }

  const labelStyles: SystemStyleObject = {
    userSelect: "none",
    marginStart: spacing,
    ...styles.label,
  }

  return (
    <chakra.label {...layoutProps} __css={rootStyles}>
      <input {...inputProps} />
      <chakra.span {...checkboxProps} __css={checkboxStyles} />
      {children && (
        <chakra.span {...labelProps} __css={labelStyles}>
          {children}
        </chakra.span>
      )}
    </chakra.label>
  )
})

if (__DEV__) {
  Radio.displayName = "Radio"
}
