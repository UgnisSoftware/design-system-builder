import React, { useState } from 'react'
import type { Story, Meta } from '@storybook/react'

import { Radio } from '../Radio/Radio'
import { RadioGroup, RadioGroupProps } from './RadioGroup'

export default {
  title: 'Elements/RadioGroup',
  component: Radio,
} as Meta

const Template: Story<RadioGroupProps> = (args) => {
  const [value, setValue] = useState('first')
  return (
    <RadioGroup {...args} value={value} onChange={(event) => setValue(event?.target?.value)}>
      <Radio value="first" label="First" />
      <Radio value="second" label="Second" />
      <Radio value="third" label="Third" />
    </RadioGroup>
  )
}

export const Default = Template.bind({})
Default.args = {
  name: 'radioGroup',
  value: '',
}
