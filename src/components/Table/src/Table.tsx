import { memo } from "react"

import HeaderRow from "./Header/HeaderRow"
import Row from "./Row/Row"
import { chakra, useMultiStyleConfig } from "~/system"

import type { Column } from "./types"

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

  return (
    <chakra.div
      __css={styles.tbody}
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
