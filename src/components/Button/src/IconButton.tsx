import { forwardRef } from "../../../system"
import { __DEV__ } from "../../../utils"
import * as React from "react"
import { Button, ButtonProps } from "./Button"

type Omitted = "leftIcon" | "isFullWidth" | "rightIcon" | "loadingText" | "iconSpacing"

interface BaseButtonProps extends Omit<ButtonProps, Omitted> {}

export interface IconButtonProps extends BaseButtonProps {
  icon?: React.ReactElement
  isRound?: boolean
}

export const IconButton = forwardRef<IconButtonProps, "button">((props, ref) => {
  const { icon, children, isRound, "aria-label": ariaLabel, ...rest } = props

  const element = icon || children
  const _children = React.isValidElement(element)
    ? React.cloneElement(element as any, {
        "aria-hidden": true,
        focusable: false,
      })
    : null

  return (
    <Button padding="0" borderRadius={isRound ? "full" : "md"} ref={ref} {...rest}>
      {_children}
    </Button>
  )
})

if (__DEV__) {
  IconButton.displayName = "IconButton"
}
