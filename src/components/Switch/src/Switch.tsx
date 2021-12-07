import * as React from "react"
import {
  chakra,
  forwardRef,
  omitThemingProps,
  SystemStyleObject,
  ThemingProps,
  useMultiStyleConfig,
  HTMLChakraProps,
  SystemProps,
} from "~/system"
import { dataAttr, __DEV__ } from "~/utils"
import { useCheckbox, UseCheckboxProps } from "~/components"

export interface SwitchProps
  extends Omit<UseCheckboxProps, "isIndeterminate">,
    Omit<HTMLChakraProps<"label">, keyof UseCheckboxProps>,
    ThemingProps<"Switch"> {
  /**
   * The spacing between the switch and its text text
   * @default 0.5rem
   * @type SystemProps["marginLeft"]
   */
  spacing?: SystemProps["marginLeft"]
  textPosition?: "left" | "right"
}

export const Switch = forwardRef<SwitchProps, "input">(({ textPosition = "right", ...props }, ref) => {
  const styles = useMultiStyleConfig("Switch", props)

  const { spacing = "0.5rem", children, ...ownProps } = omitThemingProps(props)

  const { state, getInputProps, getCheckboxProps, getRootProps, getLabelProps } = useCheckbox(ownProps)

  const containerStyles: SystemStyleObject = React.useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      lineHeight: "normal",
      ...styles.container,
    }),
    [styles.container],
  )

  const trackStyles: SystemStyleObject = React.useMemo(
    () => ({
      display: "inline-flex",
      flexShrink: 0,
      justifyContent: "flex-start",
      boxSizing: "content-box",
      cursor: "pointer",
      ...styles.track,
    }),
    [styles.track],
  )

  const labelStyles: SystemStyleObject = React.useMemo(
    () => ({
      userSelect: "none",
      paddingStart: spacing,
      paddingEnd: spacing,
      cursor: "pointer",
      ...styles.label,
    }),
    [spacing, styles.label],
  )

  const childText = (
    <chakra.span {...getLabelProps()} __css={labelStyles}>
      {children}
    </chakra.span>
  )

  return (
    <chakra.label {...getRootProps()} className={props.className} __css={containerStyles}>
      <input {...getInputProps({}, ref)} />
      {children && textPosition === "left" && childText}
      <chakra.span {...getCheckboxProps()} __css={trackStyles}>
        <chakra.span
          __css={styles.thumb}
          data-checked={dataAttr(state.isChecked)}
          data-hover={dataAttr(state.isHovered)}
        />
      </chakra.span>
      {children && textPosition === "right" && childText}
    </chakra.label>
  )
})

if (__DEV__) {
  Switch.displayName = "Switch"
}
