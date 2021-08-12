import { memo } from "react"

import HeaderRow from "./Header/HeaderRow"
import Row from "./Row/Row"
import { chakra, useMultiStyleConfig } from "~/system"

import type { Column } from "./types"
import { GRID_COLUMN_WIDTHS, GRID_ROW_HEIGHT, GRID_ROW_WIDTH } from "~/theme/src/components/table"
import { Virtuoso } from "react-virtuoso"

interface Props<Data> {
  columns: Column<Data>[]
  data: Data[]
}

function Table<Data extends {}>({ columns, data }: Props<Data>) {
  const handleColumnResize = () => {}
  const onSortChange = () => {}

  const styles = useMultiStyleConfig("Table", {})

  const columnWidths = columns.map((a) => `${a.width}px`).join(" ")
  const tableWidth = columns.map((a) => a.width).reduce((a, b) => a + b, 0)
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
      aria-colcount={columns.length}
      aria-rowcount={data.length}
    >
      <Virtuoso
        components={{
          EmptyPlaceholder: () => <div> No rows </div>,
        }}
        overscan={700}
        fixedItemHeight={rowHeight}
        topItemCount={1}
        totalCount={data.length + 1}
        useWindowScroll
        itemContent={(index) =>
          index === 0 ? (
            <HeaderRow columns={columns} onColumnResize={handleColumnResize} onSortChange={onSortChange} />
          ) : (
            <Row data={data[index - 1]} columns={columns} index={index} />
          )
        }
      />
    </chakra.div>
  )
}

export default memo(Table)
