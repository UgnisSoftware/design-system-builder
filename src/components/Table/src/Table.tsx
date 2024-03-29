import DataGrid, { DataGridHandle, DataGridProps, useRowSelection } from "react-data-grid"
import { useEffect, useRef, useState } from "react"
export { useRowSelection } from "react-data-grid"

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number
  bottomPadding?: number
}

const ROW_HEIGHT = 35

export function Table<Data extends {}>({
  columns,
  onRowClick,
  rowHeight = ROW_HEIGHT,
  className,
  ...props
}: Props<Data>) {
  const [height, setHeight] = useState(window.innerHeight)
  const ref = useRef<DataGridHandle>(null)

  useEffect(() => {
    const newHeight = (ref?.current?.element?.clientHeight || 0) - (ref?.current?.element?.offsetTop || 0)
    setHeight(newHeight || window.innerHeight)
  }, [])

  const tableHeight = Math.min(height, (props.rows.length + 1) * rowHeight)

  return (
    <DataGrid
      ref={ref}
      columns={columns}
      onRowClick={onRowClick}
      style={{ height: tableHeight, flex: 1, ...props.style }}
      rowHeight={ROW_HEIGHT}
      className={"rdg-light " + className}
      {...props}
    />
  )
}
