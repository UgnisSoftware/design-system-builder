import { chakra, forwardRef, omitThemingProps, ThemingProps, useStyleConfig, HTMLChakraProps } from "../../../system"
import { __DEV__ } from "../../../utils"

export interface ContainerProps extends HTMLChakraProps<"div">, ThemingProps<"Container"> {
  centerContent?: boolean
}

export const Container = forwardRef<ContainerProps, "div">((props, ref) => {
  const { className, centerContent, ...rest } = omitThemingProps(props)

  const styles = useStyleConfig("Container", props)

  return (
    <chakra.div
      ref={ref}
      className={className}
      {...rest}
      __css={{
        ...styles,
        ...(centerContent && {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }),
      }}
    />
  )
})

if (__DEV__) {
  Container.displayName = "Container"
}
