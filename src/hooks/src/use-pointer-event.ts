/**
 * Credit goes to `framer-motion` of this useful utilities.
 * License can be found here: https://github.com/framer/motion
 */

import { EventListenerWithPointInfo, getPointerEventName, TouchEventName, wrapPointerEventHandler } from "../../utils"
import { useEventListener } from "./use-event-listener"

export function usePointerEvent(
  env: Document | HTMLElement | null,
  eventName: TouchEventName,
  handler: EventListenerWithPointInfo,
  options?: AddEventListenerOptions,
) {
  return useEventListener(
    getPointerEventName(eventName),
    wrapPointerEventHandler(handler, eventName === "pointerdown"),
    env,
    options,
  )
}
