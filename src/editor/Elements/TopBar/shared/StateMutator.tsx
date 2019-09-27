import { ComponentStateMenu } from '@src/interfaces/ui'
import stateUi from '@state/ui'
import Select from '@components/Select'
import * as React from 'react'
import { AlignRight, Divider, IconRow, InfoColumn, Title } from './_styles'
import { getSelectedNode } from '@src/utils'

const DefaultValue = 'Default'
const changeState = (componentState: ComponentStateMenu) => {
  if (componentState === DefaultValue) {
    stateUi.stateManager = null
    return
  }
  stateUi.stateManager = componentState
}

const StateMutator = () => {
  const component = getSelectedNode()

  return (
    <AlignRight>
      <Divider />
      <InfoColumn>
        <Title>State</Title>
        <IconRow>
          <Select
            value={stateUi.stateManager}
            placeholder="Default"
            onChange={changeState}
            options={[DefaultValue].concat(Object.keys(component.states))}
          />
        </IconRow>
      </InfoColumn>
    </AlignRight>
  )
}

export default StateMutator
