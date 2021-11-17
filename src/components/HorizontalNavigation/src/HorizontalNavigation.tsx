import type React from "react"
import { Box } from "~/components"
import { StylesProvider, useMultiStyleConfig, useStyles } from "~/system"
import { chakra } from "~/system"
import { noop } from "~/utils"

type HorizontalNavigationProps = {
  children: React.ReactNode
}
export const HorizontalNavigation = ({ children, ...props }: HorizontalNavigationProps) => {
  const styles = useMultiStyleConfig("HorizontalNavigation", props)
  return (
    <StylesProvider value={styles}>
      <Box __css={styles.wrapper}>{children}</Box>
    </StylesProvider>
  )
}

type NavItemProps = {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

const NavItem = ({ children, active, disabled, onClick }: NavItemProps) => {
  const styles = useStyles()
  return (
    <chakra.div __css={styles.navItem} data-selected={active} disabled={disabled} onClick={disabled ? noop : onClick}>
      {children}
    </chakra.div>
  )
}
HorizontalNavigation.Item = NavItem
