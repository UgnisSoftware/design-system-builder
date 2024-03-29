import type * as React from "react"
import { Icon, IconProps } from "~/icon"
import {
  chakra,
  forwardRef,
  omitThemingProps,
  StylesProvider,
  SystemStyleObject,
  ThemingProps,
  useMultiStyleConfig,
  useStyles,
  HTMLChakraProps,
} from "~/system"
import { __DEV__ } from "~/utils"
import { MdClose } from "react-icons/md"

export interface TagProps extends HTMLChakraProps<"span">, ThemingProps<"Tag"> {
  isDisabled?: boolean
}

export const Tag = forwardRef<TagProps, "span">((props, ref) => {
  const styles = useMultiStyleConfig("Tag", props)
  const { isDisabled, ...ownProps } = omitThemingProps(props)

  const containerStyles: SystemStyleObject = {
    display: "inline-flex",
    verticalAlign: "top",
    alignItems: "center",
    maxWidth: "100%",
    ...styles.container,
  }

  return (
    <StylesProvider value={styles}>
      <chakra.span ref={ref} {...ownProps} data-disabled={isDisabled} __css={containerStyles} />
    </StylesProvider>
  )
})

if (__DEV__) {
  Tag.displayName = "Tag"
}

export interface TagLabelProps extends HTMLChakraProps<"span"> {}

export const TagLabel = forwardRef<TagLabelProps, "span">((props, ref) => {
  const styles = useStyles()
  return <chakra.span ref={ref} isTruncated {...props} __css={styles.label} />
})

if (__DEV__) {
  TagLabel.displayName = "TagLabel"
}

export const TagLeftIcon = forwardRef<IconProps, "svg">((props, ref) => (
  <Icon ref={ref} verticalAlign="top" marginEnd="0.5rem" {...props} />
))

if (__DEV__) {
  TagLeftIcon.displayName = "TagLeftIcon"
}

export const TagRightIcon = forwardRef<IconProps, "svg">((props, ref) => (
  <Icon ref={ref} verticalAlign="top" marginStart="0.5rem" {...props} />
))

if (__DEV__) {
  TagRightIcon.displayName = "TagRightIcon"
}

const TagCloseIcon: React.FC<IconProps> = (props) => (
  <Icon verticalAlign="inherit" as={MdClose} viewBox="0 0 512 512" title="Close" {...props} />
)

if (__DEV__) {
  TagCloseIcon.displayName = "TagCloseIcon"
}

export interface TagCloseButtonProps extends Omit<HTMLChakraProps<"button">, "disabled"> {
  isDisabled?: boolean
}

export const TagCloseButton: React.FC<TagCloseButtonProps> = (props) => {
  const { isDisabled, children, ...rest } = props

  const styles = useStyles()

  const btnStyles: SystemStyleObject = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "0",
    transition: "all 0.2s",
    ...styles.closeButton,
  }

  return (
    <chakra.button {...rest} type="button" aria-label="close" disabled={isDisabled} __css={btnStyles}>
      {children || <TagCloseIcon />}
    </chakra.button>
  )
}

if (__DEV__) {
  TagCloseButton.displayName = "TagCloseButton"
}
