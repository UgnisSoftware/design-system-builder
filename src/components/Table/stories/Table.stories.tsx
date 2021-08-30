import { Table } from "../src"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"
import { propConfig } from "~/utils/src/docPropConfig"

export default {
  title: "Table",
  parameters: {
    component: Table,
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
