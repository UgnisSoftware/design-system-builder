import { memo } from "react"

import Cell from "./Cell"
import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "../types"
import { connect } from "lape"

interface Props<Data> {
  data: Data
  columns: Column<Data>[]
  index: number
}

function Row<Data extends {}>({ columns, data, index }: Props<Data>) {
  const styles = useMultiStyleConfig("Table", {})

  const fixedColumns = columns.filter((a) => a.fixed)
  const otherColumns = columns.filter((a) => !a.fixed)

  return (
    <chakra.div __css={styles.tr} role="row" aria-rowindex={index + 1}>
      {!!fixedColumns.length && (
        <chakra.div __css={styles.trStickyContainer}>
          {fixedColumns.map((column) => (
            <Cell key={column.key} data={data} column={column} />
          ))}
        </chakra.div>
      )}
      {otherColumns.map((column) => (
        <Cell key={column.key} data={data} column={column} />
      ))}
    </chakra.div>
  )
}

export default memo(connect(Row))
