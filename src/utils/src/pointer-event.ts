/**
 * Credit goes to `framer-motion` of this useful utilities.
 * License can be found here: https://github.com/framer/motion
 */

import { addDomEvent, isBrowser } from "./dom"

type EventType = MouseEvent | TouchEvent | PointerEvent
type PointType = "page" | "client"

export function isMouseEvent(event: EventType): event is MouseEvent {
  // PointerEvent inherits from MouseEvent so we can't use a straight instanceof check.
  if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
    return event.pointerType === "mouse"
  }

  return event instanceof MouseEvent
}

export function isTouchEvent(event: EventType): event is TouchEvent {
  const hasTouches = !!(event as TouchEvent).touches
  return hasTouches
}

export interface Point2D {
  x: number
  y: number
}

export interface EventInfo {
  point: Point2D
}

export type EventHandler = (event: EventType, info: EventInfo) => void

/**
 * Filters out events not attached to the primary pointer (currently left mouse button)
 * @param eventHandler
 */
function filterPrimaryPointer(eventHandler: EventListener): EventListener {
  return (event: Event) => {
    const isMouseEvent = event instanceof MouseEvent
    const isPrimaryPointer = !isMouseEvent || (isMouseEvent && (event as MouseEvent).button === 0)
    if (isPrimaryPointer) {
      eventHandler(event)
    }
  }
}

export type EventListenerWithPointInfo = (e: EventType, info: EventInfo) => void

const defaultPagePoint = { pageX: 0, pageY: 0 }

function pointFromTouch(e: TouchEvent, pointType: PointType = "page") {
  const primaryTouch = e.touches[0] || e.changedTouches[0]
  const point = primaryTouch || defaultPagePoint
  const x = `${pointType}X` as const
  const y = `${pointType}Y` as const

  return {
    x: point[x],
    y: point[y],
  }
}

function pointFromMouse(point: MouseEvent | PointerEvent, pointType: PointType = "page") {
  const x = `${pointType}X` as const
  const y = `${pointType}Y` as const
  return {
    x: point[x],
    y: point[y],
  }
}

export function extractEventInfo(event: EventType, pointType: PointType = "page"): EventInfo {
  return {
    point: isTouchEvent(event) ? pointFromTouch(event, pointType) : pointFromMouse(event, pointType),
  }
}

export function getViewportPointFromEvent(event: EventType) {
  return extractEventInfo(event, "client")
}

export const wrapPointerEventHandler = (
  handler: EventListenerWithPointInfo,
  shouldFilterPrimaryPointer = false,
): EventListener => {
  const listener: EventListener = (event: any) => handler(event, extractEventInfo(event))

  return shouldFilterPrimaryPointer ? filterPrimaryPointer(listener) : listener
}

interface PointerNameMap {
  pointerdown: string
  pointermove: string
  pointerup: string
  pointercancel: string
  pointerover?: string
  pointerout?: string
  pointerenter?: string
  pointerleave?: string
}

const mouseEventNames = {
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointercancel: "mousecancel",
  pointerover: "mouseover",
  pointerout: "mouseout",
  pointerenter: "mouseenter",
  pointerleave: "mouseleave",
} as const

const touchEventNames = {
  pointerdown: "touchstart",
  pointermove: "touchmove",
  pointerup: "touchend",
  pointercancel: "touchcancel",
} as const

// We check for event support via functions in case they've been mocked by a testing suite.
const supportsPointerEvents = (name?: string): name is keyof PointerNameMap =>
  isBrowser && window.onpointerdown === null
const supportsTouchEvents = (name?: string): name is keyof typeof touchEventNames =>
  isBrowser && window.ontouchstart === null
const supportsMouseEvents = (name?: string): name is keyof typeof mouseEventNames =>
  isBrowser && window.onmousedown === null

type TouchEventName = keyof PointerNameMap

export function getPointerEventName(name: TouchEventName): string {
  if (supportsPointerEvents(name)) {
    return name
  }
  if (supportsTouchEvents(name)) {
    return touchEventNames[name]
  }
  if (supportsMouseEvents(name)) {
    return mouseEventNames[name]
  }

  return name
}

export function addPointerEvent(
  target: EventTarget,
  eventName: TouchEventName,
  handler: EventListenerWithPointInfo,
  options?: AddEventListenerOptions,
) {
  return addDomEvent(
    target,
    getPointerEventName(eventName),
    wrapPointerEventHandler(handler, eventName === "pointerdown"),
    options,
  )
}

export function isMultiTouchEvent(event: EventType) {
  return isTouchEvent(event) && event.touches.length > 1
}
