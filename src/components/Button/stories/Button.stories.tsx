import React from "react"
import type { Story, Meta } from "@storybook/react"
import { Button, ButtonProps } from "../src"
import { ChakraProvider } from '~/react'
import { filterUndefined } from '~/utils'
import { propConfig } from '~/utils/src/docPropConfig'
import { MdBuild, MdCall } from "react-icons/md"

const icons = { MdBuild: <MdBuild />, MdCall: <MdCall />, none: undefined }

export default {
  title: "Button",
  parameters: {
    component: Button,
  },
  args: {
    variant: "primary",
    children: "Button",
    size: "md",
  },
  argTypes: {
    ...propConfig,
    leftIcon: {
      options: Object.keys(icons),
      mapping: icons,
      control: {
        type: "select",
      },
    },
    rightIcon: {
      options: Object.keys(icons),
      mapping: icons,
      control: {
        type: "select",
      },
    },
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = (args: ButtonProps) => <Button {...filterUndefined(args)} />
