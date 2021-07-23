import * as React from "react"
import type { Meta } from "@storybook/react"
import { ChakraProvider } from "~/react"
import { propConfig } from "~/utils/src/docPropConfig"
import { Label, LabelProps } from "~/components/Label/src/Label"

export default {
  title: "Label",
  parameters: {
    component: Label,
  },
  argTypes: { ...propConfig },
  args: { text: "Some text" },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Usage = (args: LabelProps) => <Label {...args} />
