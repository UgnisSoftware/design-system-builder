import * as React from "react"
import type { Meta } from "@storybook/react"
import { HorizontalNavigation } from "../src"
import { ChakraProvider } from "~/react"
import { propConfig } from "~/utils/src/docPropConfig"

export default {
  title: "HorizontalNavigation",
  parameters: {
    component: HorizontalNavigation,
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
  return (
    <HorizontalNavigation>
      <HorizontalNavigation.Item active>Item1</HorizontalNavigation.Item>
      <HorizontalNavigation.Item>Item2</HorizontalNavigation.Item>
      <HorizontalNavigation.Item disabled>Item3</HorizontalNavigation.Item>
    </HorizontalNavigation>
  )
}
