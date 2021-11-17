import DataGrid, { DataGridProps } from "react-data-grid"
import { useEffect, useRef, useState } from "react"

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number
}

const ROW_HEIGHT = 35

export function TableEditable<Data extends {}>({ columns, onRowClick, ...props }: Props<Data>) {
  const [height, setHeight] = useState(window.innerHeight)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeight(ref?.current?.clientHeight || window.innerHeight)
  }, [])

  const tableHeight = Math.min(height, props.rows.length * (props.rowHeight || ROW_HEIGHT))

  return (
    <div ref={ref}>
      <DataGrid
        columns={columns}
        onRowClick={onRowClick}
        style={{ height: tableHeight }}
        rowHeight={ROW_HEIGHT}
        {...props}
      />
    </div>
  )
}
