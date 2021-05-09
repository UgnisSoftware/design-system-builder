import * as React from "react"
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Icon } from "../../../icon"
import { Checkbox, CheckboxGroup, CheckboxProps, useCheckbox } from "../src"
import { Stack } from "../../Stack"
import type { Meta } from "@storybook/react"
import { ChakraProvider } from "../../../react"
import { excludeProps, propConfig } from "../../../../.storybook/utils/docPropConfig"
import { MdRemove } from "react-icons/all"

export default {
  title: "Checkbox",
  parameters: {
    component: Checkbox,
  },
  args: {
    children: "Checkbox",
  },
  argTypes: {
    ...propConfig,
    ...excludeProps("aria-invalid", "aria-label", "aria-labelledby", "aria-describedby"),
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Usage = (args: CheckboxProps) => <Checkbox {...args} />

const CustomIcon = (props: any) => {
  const { isIndeterminate, ...rest } = props

  const d = isIndeterminate
    ? "M5 11H19V13H5z"
    : "M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z"

  return (
    <Icon viewBox="0 0 24 24" {...rest}>
      <path fill="currentColor" d={d} />
    </Icon>
  )
}

export const Indeterminate = () => {
  const [checkedItems, setCheckedItems] = React.useState([false, false])

  const allChecked = checkedItems.every(Boolean)
  const isIndeterminate = checkedItems.some(Boolean) && !allChecked

  return (
    <>
      <Checkbox
        isChecked={allChecked}
        isIndeterminate={isIndeterminate}
        onChange={(e) => setCheckedItems([e.target.checked, e.target.checked])}
        icon={<CustomIcon />}
      >
        Parent Checkbox
      </Checkbox>
      <Stack ml="6" mt="2" align="start">
        <Checkbox isChecked={checkedItems[0]} onChange={(e) => setCheckedItems([e.target.checked, checkedItems[1]])}>
          Child Checkbox 1
        </Checkbox>
        <Checkbox isChecked={checkedItems[1]} onChange={(e) => setCheckedItems([checkedItems[0], e.target.checked])}>
          Child Checkbox 2
        </Checkbox>
      </Stack>
    </>
  )
}
