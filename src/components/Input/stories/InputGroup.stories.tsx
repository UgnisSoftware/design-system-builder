import * as React from "react"
import type { Meta } from "@storybook/react"

import {
  InputCore,
  InputGroup,
  InputGroupProps,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  InputRightElement,
} from "~/components/Input"
import { Stack } from "~/components"
import { ChakraProvider } from "~/react"
import { chakra } from "~/system"
import { propConfig } from "~/utils/src/docPropConfig"

export default {
  title: "InputGroup",
  parameters: {
    component: InputGroup,
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

export const WithInputElement = (args: InputGroupProps) => (
  <InputGroup {...args}>
    <InputLeftElement color="gray.300" fontSize="1.2em" children="$" />
    <InputCore placeholder="Enter amount" />
  </InputGroup>
)

export const WithInputAddon = () => (
  <Stack align="start">
    <InputGroup>
      <InputLeftAddon children="+234" />
      <InputCore placeholder="Phone number..." />
    </InputGroup>

    <InputGroup>
      <InputLeftAddon children="https://" />
      <InputCore placeholder="website.com" />
      <InputRightAddon children=".com" />
    </InputGroup>
  </Stack>
)

export function PasswordInput() {
  const [show, setShow] = React.useState(false)
  const handleClick = () => setShow(!show)

  return (
    <InputGroup>
      <InputCore pr="4.5rem" type={show ? "text" : "password"} placeholder="Enter password" />
      <InputRightElement width="4.5rem">
        <chakra.button onClick={handleClick}>{show ? "Hide" : "Show"}</chakra.button>
      </InputRightElement>
    </InputGroup>
  )
}
