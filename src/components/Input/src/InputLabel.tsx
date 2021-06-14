import * as React from "react"
import { chakra, useMultiStyleConfig } from "~/system"

type InputLabelProps = {
  label: string
  children: React.ReactNode
  isRequired?: boolean
}

export const InputLabel = (props: InputLabelProps) => {
  const styles = useMultiStyleConfig("Input", props)
  const { children, label, isRequired } = props
  return (
    <chakra.label>
      <chakra.div __css={styles.label}>
        {label}
        {isRequired && <chakra.span __css={styles.requiredIndicator}>*</chakra.span>}
      </chakra.div>
      {children}
    </chakra.label>
  )
}
