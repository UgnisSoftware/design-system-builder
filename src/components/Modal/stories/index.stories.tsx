import { PortalManager } from "~/portal"
import * as React from "react"
import { ChakraProvider } from "~/react"

export * from "./Modal.stories"
export * from "./Drawer.stories"

export default {
  title: "Modal",
  decorators: [
    (Story: Function) => (
      <ChakraProvider>
        <PortalManager>
          <Story />
        </PortalManager>
      </ChakraProvider>
    ),
  ],
}
