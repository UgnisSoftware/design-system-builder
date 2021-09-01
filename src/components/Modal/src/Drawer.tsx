import { chakra, forwardRef, SystemStyleObject, useStyles, useTheme, HTMLChakraProps, ThemingProps } from "~/system"
import { Slide, SlideOptions } from "~/transition"
import { __DEV__ } from "~/utils"
import { createContext } from "~/react-utils"
import * as React from "react"
import { Modal, ModalProps, useModalContext } from "./Modal"

const [DrawerContextProvider, useDrawerContext] = createContext<DrawerOptions>()

type DrawerOptions = {
  placement?: SlideOptions["direction"]
  isFullHeight?: boolean
}

export type DrawerProps = Omit<ModalProps, "scrollBehavior"> &
  ThemingProps<"Drawer"> & {
    placement?: SlideOptions["direction"]
    isFullHeight?: boolean
  }

export function Drawer(props: DrawerProps) {
  const { isOpen, onClose, placement = "right", children, styleConfig, ...rest } = props

  const theme = useTheme()
  const drawerStyleConfig = styleConfig || theme.components?.Drawer

  return (
    <DrawerContextProvider value={{ placement }}>
      <Modal isOpen={isOpen} onClose={onClose} styleConfig={drawerStyleConfig} {...rest}>
        {children}
      </Modal>
    </DrawerContextProvider>
  )
}

const StyleSlide = chakra(Slide)

export interface DrawerContentProps extends HTMLChakraProps<"section"> {
  initialAnimation?: boolean
}

export const DrawerContent = forwardRef<DrawerContentProps, "section">((props, ref) => {
  const { className, children, initialAnimation, ...rest } = props

  const { getDialogProps, getDialogContainerProps, isOpen } = useModalContext()

  const dialogProps = getDialogProps(rest, ref) as any
  const containerProps = getDialogContainerProps()

  const styles = useStyles()

  const dialogStyles: SystemStyleObject = {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
    outline: 0,
    ...styles.dialog,
  }

  const dialogContainerStyles: SystemStyleObject = {
    display: "flex",
    width: initialAnimation ? "100vw" : "auto",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    ...styles.dialogContainer,
  }

  const { placement } = useDrawerContext()

  return (
    <chakra.div {...containerProps} __css={dialogContainerStyles}>
      <StyleSlide
        direction={placement}
        in={isOpen}
        className={className}
        initialAnimation={initialAnimation}
        {...dialogProps}
        __css={dialogStyles}
      >
        {children}
      </StyleSlide>
    </chakra.div>
  )
})

if (__DEV__) {
  DrawerContent.displayName = "DrawerContent"
}

export {
  ModalBody as DrawerBody,
  ModalCloseButton as DrawerCloseButton,
  ModalFooter as DrawerFooter,
  ModalHeader as DrawerHeader,
  ModalOverlay as DrawerOverlay,
} from "./Modal"
