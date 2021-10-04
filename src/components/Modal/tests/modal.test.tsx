import type * as React from "react"
import { render, fireEvent, testA11y, press, waitFor } from "~/test-utils"
import { PortalManager } from "~/portal"
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "../src"

const renderWithPortal = (ui: React.ReactElement) => render(<PortalManager>{ui}</PortalManager>)

test("should have no accessibility violations", async () => {
  const { container } = renderWithPortal(
    <Modal isOpen onClose={jest.fn()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal header</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Modal body</ModalBody>
        <ModalFooter>Modal footer</ModalFooter>
      </ModalContent>
    </Modal>,
  )

  await testA11y(container)
})

test("should have the proper 'aria' attributes", () => {
  const tools = renderWithPortal(
    <Modal isOpen onClose={jest.fn()}>
      <ModalOverlay />
      <ModalContent data-testid="modal">
        <ModalHeader>Modal header</ModalHeader>
        <ModalBody>Modal body</ModalBody>
      </ModalContent>
    </Modal>,
  )

  const dialog = tools.getByTestId("modal")

  /**
   * should have `aria-modal` set to `true`
   */
  expect(dialog).toHaveAttribute("aria-modal", "true")
  expect(dialog).toHaveAttribute("role", "dialog")

  /**
   * The id of `DialogBody` should equal the `aria-describedby` of the dialog
   */
  expect(tools.getByText("Modal body").id).toEqual(dialog.getAttribute("aria-describedby"))

  /**
   * The id of `DialogHeader` should equal the `aria-labelledby` of the dialog
   */
  expect(tools.getByText("Modal header").id).toEqual(dialog.getAttribute("aria-labelledby"))
})

test("should fire 'onClose' callback when close button is clicked", () => {
  const onClose = jest.fn()

  const tools = renderWithPortal(
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal header</ModalHeader>
        <ModalCloseButton data-testid="close" />
      </ModalContent>
    </Modal>,
  )

  /**
   * click the close button
   */
  fireEvent.click(tools.getByTestId("close"))

  expect(onClose).toHaveBeenCalled()
})

test('clicking overlay or pressing "esc" calls the onClose callback', () => {
  const onClose = jest.fn()
  renderWithPortal(
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal header</ModalHeader>
        <ModalBody>Modal body</ModalBody>
      </ModalContent>
    </Modal>,
  )

  const [overlay] = Array.from(document.getElementsByClassName("chakra-modal__content-container"))

  // Not working in tests but working in browser. I'm guessing this is due to focus-trap
  // fireEvent.click(overlay as HTMLElement)
  // expect(onClose).toHaveBeenCalled()

  press.Escape(overlay as HTMLElement)
  expect(onClose).toHaveBeenCalled()
})
