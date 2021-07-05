import { useRef } from "react"
import { useEventListener } from "./use-event-listener"

/**
 * @deprecated `useMouseDownRef` will be removed in a future version.
 */
export function useMouseDownRef(shouldListen = true) {
  const mouseDownRef = useRef<EventTarget | null>()

  useEventListener("mousedown", (event) => {
    if (shouldListen) {
      mouseDownRef.current = event.target
    }
  })

  return mouseDownRef as React.RefObject<HTMLElement>
}
