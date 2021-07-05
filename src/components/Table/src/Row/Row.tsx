import { memo } from "react"

import Cell from "./Cell"
import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "../types"

interface Props<Data> {
  data: Data
  columns: Column<Data>[]
}

function Row<Data extends {}>({ columns, data }: Props<Data>) {
  const styles = useMultiStyleConfig("Table", {})

  return (
    <chakra.div __css={styles.tr} role="row">
      {columns.map((column) => (
        <Cell key={column.key} data={data} column={column} />
      ))}
    </chakra.div>
  )
}

export default memo(Row)
