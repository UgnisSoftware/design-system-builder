import HeaderRow from "./Header/HeaderRow"
import Row from "./Row/Row"
import { chakra, useMultiStyleConfig } from "~/system"

import type { Column } from "./types"
import { GRID_COLUMN_WIDTHS, GRID_ROW_HEIGHT, GRID_ROW_WIDTH } from "~/theme/src/components/table"
import { useLape } from "lape"

interface Props<Data> {
  columns: Column<Data>[]
  data: Data[]
  onRowClick?: (row: Data) => void
}

export function Table<Data extends {}>({ columns, data, onRowClick }: Props<Data>) {
  const mutableColumns = useLape(columns)
  const handleColumnResize = (column: any, width: number) => {
    column.width = width
  }
  const onSortChange = () => {}

  const styles = useMultiStyleConfig("Table", {})

  const columnWidths = mutableColumns.map((a) => `${a.width}px`).join(" ")
  const tableWidth = mutableColumns.map((a) => a.width).reduce((a, b) => a + b, 0)
  const rowHeight = 35

  return (
    <chakra.div
      __css={styles.tbody}
      sx={{
        [GRID_COLUMN_WIDTHS]: columnWidths,
        [GRID_ROW_WIDTH]: `${tableWidth}px`,
        [GRID_ROW_HEIGHT]: `${rowHeight}px`,
      }}
      role="table"
      aria-colcount={mutableColumns.length}
      aria-rowcount={data.length}
    >
      <HeaderRow columns={mutableColumns} onColumnResize={handleColumnResize} onSortChange={onSortChange} />
      {data.map((item, index) => (
        <Row data={item} columns={mutableColumns} index={index} onRowClick={onRowClick} />
      ))}
      {!data.length && <>No data </>}
    </chakra.div>
  )
}
