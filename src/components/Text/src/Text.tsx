import {
  chakra,
  forwardRef,
  omitThemingProps,
  SystemProps,
  ThemingProps,
  useStyleConfig,
  HTMLChakraProps,
} from "../../../system"
import { __DEV__ } from "../../../utils"

export type TextProps = HTMLChakraProps<"p"> &
  ThemingProps<"Text"> &
  Pick<SystemProps, "textAlign" | "textDecoration" | "textTransform">

export const Text = forwardRef<TextProps, "p">((props, ref) => {
  const styles = useStyleConfig("Text", props)
  const { className, ...rest } = omitThemingProps(props)
  return <chakra.p ref={ref} {...rest} __css={styles} className={className} />
})

if (__DEV__) {
  Text.displayName = "Text"
}
