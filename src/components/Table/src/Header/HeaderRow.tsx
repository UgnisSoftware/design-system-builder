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

  const fixedColumns = columns.filter((a) => a.fixed)
  const otherColumns = columns.filter((a) => !a.fixed)

  return (
    <chakra.div __css={styles.thead} role="row" aria-rowindex={1}>
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          backgroundColor: "white",
          willChange: "transform",
          marginLeft: -16,
        }}
      >
        {fixedColumns.map((column) => (
          <HeaderCell key={column.key} column={column} onColumnResize={onColumnResize} onSortChange={onSortChange} />
        ))}
      </div>
      {otherColumns.map((column) => (
        <HeaderCell key={column.key} column={column} onColumnResize={onColumnResize} onSortChange={onSortChange} />
      ))}
    </chakra.div>
  )
}

export default memo(HeaderRow)
