import type * as React from "react"
import { chakra, SystemStyleObject, useMultiStyleConfig } from "~/system"

export type LabelProps = {
  text: string
  children?: React.ReactNode
  isRequired?: boolean
}

export const Label = (props: LabelProps) => {
  const styles = useMultiStyleConfig("Label", props)
  const { children, text, isRequired } = props
  const rootStyles: SystemStyleObject = {
    width: "100%",
  }
  return (
    <chakra.label __css={rootStyles}>
      <chakra.div __css={styles.label}>
        {text}
        {isRequired && <chakra.span __css={styles.requiredIndicator}>*</chakra.span>}
      </chakra.div>
      {children}
    </chakra.label>
  )
}
