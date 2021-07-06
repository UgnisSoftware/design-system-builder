import { memo } from "react"

import HeaderRow from "./Header/HeaderRow"
import Row from "./Row/Row"
import { chakra, useMultiStyleConfig } from "~/system"

import type { Column } from "./types"
import { GRID_COLUMN_WIDTHS, GRID_ROW_HEIGHT, GRID_ROW_WIDTH } from "~/theme/src/components/table"

interface Props<Data> {
  columns: Column<Data>[]
  data: Data[]
}

function Table<Data extends {}>({ columns, data }: Props<Data>) {
  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollLeft } = event.currentTarget
  }

  const handleColumnResize = () => {}
  const onSortChange = () => {}

  const styles = useMultiStyleConfig("Table", {})

  const columnWidths = columns.map((a) => `${a.width}px`).join(" ")
  const tableWidth = columns.map((a) => a.width).reduce((a, b) => a + b, 0)

  return (
    <chakra.div
      __css={styles.tbody}
      sx={{
        [GRID_COLUMN_WIDTHS]: columnWidths,
        [GRID_ROW_WIDTH]: `${tableWidth}px`,
        [GRID_ROW_HEIGHT]: "35px",
      }}
      role="table"
      aria-colcount={columns.length}
      aria-rowcount={data.length}
      onScroll={handleScroll}
    >
      <HeaderRow columns={columns} onColumnResize={handleColumnResize} onSortChange={onSortChange} />
      {data.length === 0 ? <div> No rows </div> : data.map((rowData) => <Row data={rowData} columns={columns} />)}
    </chakra.div>
  )
}

export default memo(Table)
