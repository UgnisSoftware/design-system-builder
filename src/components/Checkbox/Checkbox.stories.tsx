import React, { useState } from 'react'
import type { Story, Meta } from '@storybook/react'

import { Checkbox } from './Checkbox'

export default {
  title: 'Elements/Checkbox',
  component: Checkbox,
} as Meta

const Template: Story<any> = (args) => {
  const [checked, setChecked] = useState<'indeterminate' | boolean>('indeterminate')
  return <Checkbox {...args} checked={checked} value="something" label="Some label" name="aaa" onChange={setChecked} />
}

export const Default = Template.bind({})
Default.args = {
  name: 'checkbox',
}
