import { memo } from "react"

import { chakra, useMultiStyleConfig } from "~/system"
import type { Column } from "../types"

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

    const { currentTarget, pointerId } = event
    const { right } = currentTarget.getBoundingClientRect()
    const offset = right - event.clientX

    if (offset > 11) {
      // +1px to account for the border size
      return
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== pointerId) return
      if (event.pointerType === "mouse" && event.buttons !== 1) {
        onPointerUp(event)
        return
      }
      const width = event.clientX + offset - currentTarget.getBoundingClientRect().left
      if (width > 0) {
        onColumnResize(column, width)
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== pointerId) return
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
      // onPointerDown={column.resizable ? onPointerDown : undefined}
    >
      {column.name}
    </chakra.div>
  )
}

export default memo(HeaderCell)
