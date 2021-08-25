import type React from "react"
import { Drawer, DrawerContent, DrawerOverlay } from "~/components/Modal"
import { noop } from "~/utils"
import { useBreakpoint } from "~/media-query"
import { chakra, ThemeTypings, useMultiStyleConfig, useTheme } from "~/system"

export type VerticalNavigationProps = {
  isOpen?: boolean
  /*
   * If shouldAnimateOnBreakpoints prop is passed,
   * navigation will animate only on those breakpoints
   * */
  shouldAnimateOnBreakpoints?: ThemeTypings["breakpoints"][]
  onClose?: () => void
  children: React.ReactNode
}

export const VerticalNavigation = (props: VerticalNavigationProps) => {
  const { isOpen, shouldAnimateOnBreakpoints, onClose, children } = props
  const breakpoint = useBreakpoint() as ThemeTypings["breakpoints"]
  const shouldAnimate = shouldAnimateOnBreakpoints ? shouldAnimateOnBreakpoints.includes(breakpoint!) : true
  const handleOnClose = shouldAnimate && onClose ? onClose : noop
  const theme = useTheme()
  const styleConfig = theme.components?.VerticalNavigation
  return (
    <Drawer
      isOpen={isOpen ?? !shouldAnimate}
      onClose={handleOnClose}
      placement="left"
      size="2xs"
      styleConfig={styleConfig}
    >
      {shouldAnimate && <DrawerOverlay />}
      <DrawerContent initialAnimation={shouldAnimate}>{children}</DrawerContent>
    </Drawer>
  )
}

type ListProps = {
  children: React.ReactNode
}

const List = ({ children }: ListProps) => {
  const rootStyle = { listStyle: "none" }
  return (
    <chakra.ul role="list" __css={rootStyle}>
      {children}
    </chakra.ul>
  )
}

type ListItemProps = {
  children: React.ReactNode
  onClick?: (item?: unknown) => void
}

const ListItem = (props: ListItemProps) => {
  const { children, onClick } = props
  const styles = useMultiStyleConfig("VerticalNavigation", props)
  return (
    <chakra.li __css={styles.listItem} onClick={onClick}>
      {children}
    </chakra.li>
  )
}

VerticalNavigation.List = List
VerticalNavigation.ListItem = ListItem
