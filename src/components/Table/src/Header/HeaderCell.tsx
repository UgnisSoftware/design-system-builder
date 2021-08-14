import { memo } from "react"

import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "../types"
import { connect } from "lape"

export interface Props<Data> {
  column: Column<Data>
  onSortChange: (checked: boolean) => void
  onColumnResize: (column: any, width: number) => void
}

function HeaderCell<Data extends {}>({ column, onColumnResize, onSortChange }: Props<Data>) {
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.buttons !== 1) {
      return
    }

    const pointerId = event.pointerId
    const initialPosition = event.clientX
    const initialWidth = column.width

    function onPointerMove(event: PointerEvent) {
      if (event?.pointerId !== pointerId) return
      if (event.pointerType === "mouse" && event.buttons !== 1) {
        onPointerUp(event)
        return
      }
      const width = initialWidth + (event.clientX - initialPosition)
      if (width > 10) {
        onColumnResize(column, width)
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event?.pointerId !== pointerId) return
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }

    event.preventDefault()
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  const styles = useMultiStyleConfig("Table", {})
  return (
    <chakra.div
      __css={styles.th}
      role="columnheader"
      // aria-colindex={column.idx + 1}
      aria-sort="ascending"
    >
      {column.name}
      <chakra.div __css={styles.thResizeHandle} onPointerDown={onPointerDown} />
    </chakra.div>
  )
}

export default memo(connect(HeaderCell))
