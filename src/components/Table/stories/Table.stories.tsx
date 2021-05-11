import React from "react"
import type { Story, Meta } from "@storybook/react"
import { ChakraProvider } from "~/react"
import { filterUndefined } from "~/utils"
import { propConfig } from "../../../utils/src/docPropConfig"
import { MdBuild, MdCall } from "react-icons/md"
import { Button, ButtonProps } from "~/components/Button"

const icons = { MdBuild: <MdBuild />, MdCall: <MdCall />, none: undefined }

export default {
  title: "Table",
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

export const Usage = (args: ButtonProps) => <Button {...filterUndefined(args)} />
