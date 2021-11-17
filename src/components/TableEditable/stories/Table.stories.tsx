import { TableEditable } from "../src"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"
import { propConfig } from "~/utils/src/docPropConfig"
import { Box } from "~/components"

export default {
  title: "Table Editable",
  parameters: {
    component: TableEditable,
    layout: "fullscreen",
  },
  argTypes: {
    ...propConfig,
  },
  args: {
    children: "Lorem ipsum",
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export * from "./Simple"
