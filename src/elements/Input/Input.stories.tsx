import React from "react"
import type { Story, Meta } from "@storybook/react"

import { Input, InputProps } from "./Input"

export default {
  title: "Elements/Input",
  component: Input,
} as Meta

const Template: Story<InputProps> = (args) => <Input {...args} />

export const Default = Template.bind({})
Default.args = {
  variant: "primary",
  children: "Input",
}
