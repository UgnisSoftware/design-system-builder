import { Spinner } from "~/components/Spinner"
import {
  chakra,
  forwardRef,
  omitThemingProps,
  SystemProps,
  SystemStyleObject,
  ThemingProps,
  useStyleConfig,
  HTMLChakraProps,
} from "~/system"
import { dataAttr, mergeWith, __DEV__, noop } from "~/utils"
import * as React from "react"
import { useButtonGroup } from "./ButtonGroup"

export interface ButtonOptions {
  /**
   * If `true`, the button will show a spinner.
   */
  isLoading?: boolean
  /**
   * If `true`, the button will be styled in its active state.
   */
  isActive?: boolean
  /**
   * If `true`, the button will be disabled.
   */
  isDisabled?: boolean
  /**
   * The text to show in the button when `isLoading` is true
   * If no text is passed, it only shows the spinner
   */
  loadingText?: string
  /**
   * If `true`, the button will take up the full width of its container.
   */
  isFullWidth?: boolean
  /**
   * The html button type to use.
   */
  type?: "button" | "reset" | "submit"
  /**
   * If added, the button will show an icon before the button's text.
   * @type React.ReactElement
   */
  leftIcon?: React.ReactElement
  /**
   * If added, the button will show an icon after the button's text.
   * @type React.ReactElement
   */
  rightIcon?: React.ReactElement
  /**
   * The space between the button icon and text.
   * @type SystemProps["marginRight"]
   */
  iconSpacing?: SystemProps["marginRight"]
  /**
   * Replace the spinner component when `isLoading` is set to `true`
   * @type React.ReactElement
   */
  spinner?: React.ReactElement
}

export interface ButtonProps extends HTMLChakraProps<"button">, ButtonOptions, ThemingProps<"Button"> {}

export const Button = forwardRef<ButtonProps, "button">((props, ref) => {
  const group = useButtonGroup()
  const styles = useStyleConfig("Button", { ...group, ...props })
  const {
    isDisabled = group?.isDisabled,
    isLoading,
    isActive,
    isFullWidth,
    children,
    leftIcon,
    rightIcon,
    loadingText,
    iconSpacing = "0.5rem",
    type = "button",
    spinner,
    className,
    as,
    onClick,
    ...rest
  } = omitThemingProps(props)

  /**
   * When button is used within ButtonGroup (i.e flushed with sibling buttons),
   * it is important to add a `zIndex` on focus.
   *
   * So let's read the component styles and then add `zIndex` to it.
   */
  const _focus = mergeWith({}, styles?.["_focus"] ?? {}, { zIndex: 1 })

  const buttonStyles: SystemStyleObject = {
    display: "inline-flex",
    appearance: "none",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 250ms",
    userSelect: "none",
    position: "relative",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    outline: "none",
    width: isFullWidth ? "100%" : "auto",
    ...styles,
    ...(!!group && { _focus }),
  }

  return (
    <chakra.button
      onClick={isDisabled || isLoading ? noop : onClick}
      disabled={isDisabled}
      ref={ref}
      as={as}
      type={as ? undefined : type}
      data-active={dataAttr(isActive)}
      data-loading={dataAttr(isLoading)}
      __css={buttonStyles}
      className={className}
      {...rest}
    >
      {leftIcon && !isLoading && <ButtonIcon marginEnd={iconSpacing}>{leftIcon}</ButtonIcon>}
      {isLoading && (
        <ButtonSpinner __css={{ fontSize: "1em", lineHeight: "normal" }} spacing={iconSpacing} label={loadingText}>
          {spinner}
        </ButtonSpinner>
      )}
      {isLoading ? loadingText || <chakra.span opacity={0}>{children}</chakra.span> : children}
      {rightIcon && !isLoading && <ButtonIcon marginStart={iconSpacing}>{rightIcon}</ButtonIcon>}
    </chakra.button>
  )
})

if (__DEV__) {
  Button.displayName = "Button"
}

const ButtonIcon: React.FC<HTMLChakraProps<"span">> = (props) => {
  const { children, className, ...rest } = props

  const _children = React.isValidElement(children)
    ? React.cloneElement(children, {
        "aria-hidden": true,
        focusable: false,
      })
    : children

  return (
    <chakra.span {...rest} className={className}>
      {_children}
    </chakra.span>
  )
}

if (__DEV__) {
  ButtonIcon.displayName = "ButtonIcon"
}

interface ButtonSpinnerProps extends HTMLChakraProps<"div"> {
  label?: string
  /**
   * @type SystemProps["margin"]
   */
  spacing?: SystemProps["margin"]
}

const ButtonSpinner: React.FC<ButtonSpinnerProps> = (props) => {
  const { label, spacing, children = <Spinner color="currentColor" width="1em" height="1em" />, __css, ...rest } = props

  const spinnerStyles: SystemStyleObject = {
    display: "flex",
    alignItems: "center",
    position: label ? "relative" : "absolute",
    marginEnd: label ? spacing : 0,
    ...__css,
  }

  return (
    <chakra.div {...rest} __css={spinnerStyles}>
      {children}
    </chakra.div>
  )
}

if (__DEV__) {
  ButtonSpinner.displayName = "ButtonSpinner"
}
