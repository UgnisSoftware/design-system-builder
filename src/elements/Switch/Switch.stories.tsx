import React, { useState } from 'react'
import type { Story, Meta } from '@storybook/react'

import { Switch } from './Switch'
import { Text } from '../Text/Text'

export default {
  title: 'Elements/Switch',
  component: Switch,
} as Meta

const Template: Story<any> = (args) => {
  const [checked, setChecked] = useState(true)
  return (
    <Switch
      {...args}
      checked={checked}
      value="one"
      name="switch"
      onChange={setChecked}
      textRight={<Text ml={0.5}>Some switch</Text>}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  name: 'switch',
}
