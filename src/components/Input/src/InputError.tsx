import { Collapse } from "~/transition"
import { useMultiStyleConfig, chakra } from "~/system"

type Props = {
  error?: string
}
export const InputError = ({ error, ...props }: Props) => {
  const styles = useMultiStyleConfig("Input", props)

  return (
    <Collapse in={!!error}>
      <chakra.div __css={styles.errorMessage}>{error}</chakra.div>
    </Collapse>
  )
}
