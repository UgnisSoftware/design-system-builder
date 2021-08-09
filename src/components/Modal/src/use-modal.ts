import { useIds } from "~/hooks"
import { callAllHandlers } from "~/utils"
import { mergeRefs, PropGetter } from "~/react-utils"
import { KeyboardEvent, MouseEvent, useCallback, useRef, useState } from "react"
import { manager, useModalManager } from "./modal-manager"

export interface UseModalProps {
  /**
   * If `true`, the modal will be open.
   */
  isOpen: boolean
  /**
   * The `id` of the modal
   */
  id?: string
  /**
   * Callback invoked to close the modal.
   */
  onClose(): void
  /**
   * If `true`, the modal will close when the overlay is clicked
   * @default true
   */
  closeOnOverlayClick?: boolean
  /**
   * If `true`, the modal will close when the `Esc` key is pressed
   * @default true
   */
  closeOnEsc?: boolean
  /**
   * Callback fired when the overlay is clicked.
   */
  onOverlayClick?(): void
  /**
   * Callback fired when the escape key is pressed and focus is within modal
   */
  onEsc?(): void
  /**
   * A11y: If `true`, the siblings of the `modal` will have `aria-hidden`
   * set to `true` so that screen readers can only see the `modal`.
   *
   * This is commonly known as making the other elements **inert**
   *
   *  @default true
   */
  useInert?: boolean
}

/**
 * Modal hook that manages all the logic for the modal dialog widget
 * and returns prop getters, state and actions.
 *
 * @param props
 */
export function useModal(props: UseModalProps) {
  const {
    isOpen,
    onClose,
    id,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    useInert = true,
    onOverlayClick: onOverlayClickProp,
    onEsc,
  } = props

  const dialogRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLElement>(null)

  const [dialogId, headerId, bodyId] = useIds(id, `chakra-modal`, `chakra-modal--header`, `chakra-modal--body`)

  /**
   * Hook use to manage multiple or nested modals
   */
  useModalManager(dialogRef, isOpen)

  const mouseDownTarget = useRef<EventTarget | null>(null)

  const onMouseDown = useCallback((event: MouseEvent) => {
    mouseDownTarget.current = event.target
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()

        if (closeOnEsc) {
          onClose?.()
        }

        onEsc?.()
      }
    },
    [closeOnEsc, onClose, onEsc],
  )

  const [headerMounted, setHeaderMounted] = useState(false)
  const [bodyMounted, setBodyMounted] = useState(false)

  const getDialogProps: PropGetter = useCallback(
    (props = {}, ref = null) => ({
      role: "dialog",
      ...props,
      ref: mergeRefs(ref, dialogRef),
      id: dialogId,
      tabIndex: -1,
      "aria-modal": true,
      "aria-labelledby": headerMounted ? headerId : undefined,
      "aria-describedby": bodyMounted ? bodyId : undefined,
      onClick: callAllHandlers(props.onClick, (event: MouseEvent) => event.stopPropagation()),
    }),
    [bodyId, bodyMounted, dialogId, headerId, headerMounted],
  )

  const onOverlayClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      /**
       * Make sure the event starts and ends on the same DOM element.
       *
       * This is used to prevent the modal from closing when you
       * start dragging from the content, and release drag outside the content.
       *
       * We prevent this because it is technically not a considered "click outside"
       */
      if (mouseDownTarget.current !== event.target) return

      /**
       * When you click on the overlay, we want to remove only the topmost modal
       */
      if (!manager.isTopModal(dialogRef)) return

      if (closeOnOverlayClick) {
        onClose?.()
      }

      onOverlayClickProp?.()
    },
    [onClose, closeOnOverlayClick, onOverlayClickProp],
  )

  const getDialogContainerProps: PropGetter = useCallback(
    (props = {}, ref = null) => ({
      ...props,
      ref: mergeRefs(ref, overlayRef),
      onClick: callAllHandlers(props.onClick, onOverlayClick),
      onKeyDown: callAllHandlers(props.onKeyDown, onKeyDown),
      onMouseDown: callAllHandlers(props.onMouseDown, onMouseDown),
    }),
    [onKeyDown, onMouseDown, onOverlayClick],
  )

  return {
    isOpen,
    onClose,
    headerId,
    bodyId,
    setBodyMounted,
    setHeaderMounted,
    dialogRef,
    overlayRef,
    getDialogProps,
    getDialogContainerProps,
  }
}

export type UseModalReturn = ReturnType<typeof useModal>
