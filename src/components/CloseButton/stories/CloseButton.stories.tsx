import * as React from "react"
import { CloseButton } from "../src"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"

export default {
  title: "CloseButton",
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Default = () => <CloseButton />

export const State = () => <CloseButton isDisabled />

/**
 * Pass the size prop to adjust the size of the close button.
 * Values can be sm, md or lg.
 */

export const Sizes = () => (
  <>
    <CloseButton size="sm" />
    <CloseButton size="md" />
    <CloseButton size="lg" />
  </>
)
