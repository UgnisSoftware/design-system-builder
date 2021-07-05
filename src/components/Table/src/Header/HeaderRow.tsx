import { memo } from "react"

import HeaderCell from "./HeaderCell"
import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "~/components"

interface Props<Data> {
  columns: Column<Data>[]
  onSortChange: (checked: boolean) => void
  onColumnResize: (column: any, width: number) => void
}

function HeaderRow<Data extends {}>({ columns, onColumnResize, onSortChange }: Props<Data>) {
  const styles = useMultiStyleConfig("Table", {})

  return (
    <chakra.div __css={styles.thead} role="row" aria-rowindex={1}>
      {columns.map((column) => (
        <HeaderCell key={column.key} column={column} onColumnResize={onColumnResize} onSortChange={onSortChange} />
      ))}
    </chakra.div>
  )
}

export default memo(HeaderRow)
