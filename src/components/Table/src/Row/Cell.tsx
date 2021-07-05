import { memo } from "react"

import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "../types"

interface Props<Data> {
  data: Data
  column: Column<Data>
}

function Cell<Data extends { [key: string]: string }>({ column, data }: Props<Data>) {
  const styles = useMultiStyleConfig("Table", {})

  return (
    <chakra.div
      __css={styles.td}
      role="cell"
      // aria-colindex={column.idx + 1} // aria-colindex is 1-based
    >
      {data[column.key]}
    </chakra.div>
  )
}

export default memo(Cell)
