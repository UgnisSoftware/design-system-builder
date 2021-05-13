import * as React from "react"
import { Spinner, SpinnerProps } from "../src"
import { propConfig } from "~/utils/src/docPropConfig"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"

export default {
  title: "Spinner",
  parameters: {
    component: Spinner,
  },
  argTypes: {
    ...propConfig,
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = (args: SpinnerProps) => <Spinner {...args} />
