import DataGrid, { DataGridHandle, DataGridProps } from "react-data-grid"
import { useEffect, useRef, useState } from "react"

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number
}

const ROW_HEIGHT = 35

export function TableEditable<Data extends {}>({ columns, onRowClick, ...props }: Props<Data>) {
  const [height, setHeight] = useState(window.innerHeight)
  const ref = useRef<DataGridHandle>(null)

  useEffect(() => {
    setHeight(ref?.current?.element?.clientHeight || window.innerHeight)
  }, [])

  const tableHeight = Math.min(height, props.rows.length * (props.rowHeight || ROW_HEIGHT))

  return (
    <DataGrid
      ref={ref}
      columns={columns}
      onRowClick={onRowClick}
      style={{ height: tableHeight, flex: 1, ...props.style }}
      rowHeight={ROW_HEIGHT}
      {...props}
    />
  )
}
