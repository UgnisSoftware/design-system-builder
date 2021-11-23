import type * as React from "react"
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
import { createContext } from "~/react-utils"
import { MdError, MdInfo } from "react-icons/all"
import { MdCheckCircle } from "react-icons/md"
import { CloseButton } from "~/components/CloseButton"

const STATUSES = {
  primary: { icon: MdInfo },
  warning: { icon: MdError },
  success: { icon: MdCheckCircle },
  error: { icon: MdError },
}

export type AlertStatus = keyof typeof STATUSES

type AlertContext = {
  status: AlertStatus
}

const [AlertProvider, useAlertContext] = createContext<AlertContext>({
  name: "AlertContext",
  errorMessage: "useAlertContext: `context` is undefined. Seems you forgot to wrap alert components in `<Alert />`",
})

type AlertOptions = {
  status?: AlertStatus
}

export type AlertProps = HTMLChakraProps<"div"> & AlertOptions & ThemingProps<"Alert">

export const Alert = forwardRef<AlertProps, "div">((props, ref) => {
  const { status = "primary", ...rest } = omitThemingProps(props)

  const styles = useMultiStyleConfig("Alert", { ...props, status })

  const alertStyles: SystemStyleObject = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    ...styles.container,
  }

  return (
    <AlertProvider value={{ status }}>
      <StylesProvider value={styles}>
        <chakra.div role="alert" ref={ref} {...rest} className={props.className} __css={alertStyles} />
      </StylesProvider>
    </AlertProvider>
  )
})

export type AlertTitleProps = HTMLChakraProps<"div">

export const AlertTitle = forwardRef<AlertTitleProps, "div">((props, ref) => {
  const styles = useStyles()

  return <chakra.div ref={ref} {...props} className={props.className} __css={styles.title} />
})

export type AlertDescriptionProps = HTMLChakraProps<"div">

export const AlertDescription = forwardRef<AlertDescriptionProps, "div">((props, ref) => {
  const styles = useStyles()
  const descriptionStyles: SystemStyleObject = {
    display: "inline",
    ...styles.description,
  }

  return <chakra.div ref={ref} {...props} className={props.className} __css={descriptionStyles} />
})

export type AlertIconProps = HTMLChakraProps<"span"> & { size?: string }

export const AlertIcon: React.FC<AlertIconProps> = (props) => {
  const { status } = useAlertContext()
  const { icon: BaseIcon } = STATUSES[status]
  const styles = useStyles()

  return (
    <chakra.span {...props} className={props.className} __css={styles.icon}>
      <BaseIcon
        size={props.size || "25px"}
        style={{ position: "absolute", transform: "translate(-50%, -50%)", left: "50%", top: "50%" }}
      />
    </chakra.span>
  )
}

type AlertCloseButton = {
  onClose?: () => void
}

export const AlertCloseButton = ({ onClose }: AlertCloseButton) => (
  <CloseButton size="sm" onClick={onClose} position="absolute" insetEnd={1} top={1} />
)
