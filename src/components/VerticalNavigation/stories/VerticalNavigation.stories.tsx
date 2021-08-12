import * as React from "react"
import type { Meta } from "@storybook/react"

import { Box, Button } from "~/components"
import { VerticalNavigation } from "../src"
import { ChakraProvider } from "~/react"
import { propConfig } from "~/utils/src/docPropConfig"

const items = [{ label: "Employees" }, { label: "Page One" }, { label: "Second Page" }]

export default {
  title: "VerticalNavigation",
  parameters: {
    component: VerticalNavigation,
    layout: "fullscreen",
  },
  args: {
    isOpen: false,
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

export const Basic = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <Box height="100vh" width={"100%"} bg={"neutral.50"}>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <VerticalNavigation isOpen={isOpen} onClose={() => setIsOpen(false)} shouldAnimateOnBreakpoints={["xl"]}>
        <VerticalNavigation.List>
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <VerticalNavigation.ListItem key={`${item.label}${index}`}>{item.label}</VerticalNavigation.ListItem>
          ))}
        </VerticalNavigation.List>
      </VerticalNavigation>
    </Box>
  )
}

export const List = () => (
  <Box>
    <VerticalNavigation.List>
      <VerticalNavigation.ListItem>Number One</VerticalNavigation.ListItem>
      <VerticalNavigation.ListItem>Number Two</VerticalNavigation.ListItem>
    </VerticalNavigation.List>
  </Box>
)
