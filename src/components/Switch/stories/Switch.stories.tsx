import type { Meta } from "@storybook/react"
import { chakra } from "~/system"
import { Switch, SwitchProps } from "../src"
import { propConfig } from "~/utils/src/docPropConfig"
import { ChakraProvider } from "~/react"
import { filterUndefined } from "~/utils"

export default {
  title: "Switch",
  parameters: {
    component: Switch,
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

export const Basic = (args: SwitchProps) => <Switch colorScheme="green" {...filterUndefined(args)} />
export const Usage = () => <Switch>Enable email alerts?</Switch>
export const TextOnLeft = (args: SwitchProps) => (
  <Switch colorScheme="green" {...filterUndefined(args)} textPosition="left">
    Hello
  </Switch>
)
