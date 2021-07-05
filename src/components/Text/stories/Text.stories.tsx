import type { Meta } from "@storybook/react"
import { ChakraProvider } from "~/react"
import { Text, TextProps } from "../src"
import { propConfig } from "~/utils/src/docPropConfig"

export default {
  title: "Text",
  parameters: {
    component: Text,
  },
  argTypes: {
    ...propConfig,
  },
  args: {
    children: "Loerm ipsum",
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = (args: TextProps) => <Text {...args} />
