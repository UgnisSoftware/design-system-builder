import type { Meta } from "@storybook/react"
import { ChakraProvider } from "../../../react"
import { Radio, RadioProps } from "../src"
import { propConfig } from "../../../utils/src/docPropConfig"
import { filterUndefined } from "../../../utils"

export default {
  title: "Radio",
  parameters: {
    component: Radio,
    controls: { sort: "alpha" },
  },
  argTypes: { ...propConfig },
  args: { children: "Radio" },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Usage = (args: RadioProps) => <Radio {...filterUndefined(args)} />
