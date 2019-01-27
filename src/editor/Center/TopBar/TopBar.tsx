import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Border, ComponentView } from '@src/interfaces'
import AddComponent from '@src/editor/Center/TopBar/AddComponent'
import { Colors } from '@src/styles'

const TopBarBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background: rgb(248, 248, 248);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  font-size: 24px;
  user-select: none;
  height: 64px;
`

const Divider = styled.div`
  width: 3px;
  height: 85%;
  flex: 0 0 2px;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 12px 0 8px;
`

const ColorBox = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 4px;
  background: ${({ color }: any) => color};
  cursor: pointer;
`

const BorderBox = styled.div`
  border: ${({ border }) => border.style};
  border-radius: ${({ border }) => border.radius};
  background: ${({ selected }) => (selected ? Colors.accent : 'white')};
  margin-right: 4px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`
const InfoColumn = styled.div`
  height: 48px;
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
`

const IconRow = styled.div`
  margin: auto 0;
  display: flex;
  align-items: center;
`
const selectComponentView = (view: ComponentView) => () => {
  state.ui.componentView = view
}

const changeBackground = (colorId: string) => () => {
  state.ui.selectedNode.background.colorId = colorId
}

const removeBorder = () => () => {
  state.ui.selectedNode.border = null
}
const changeBorder = (border: Border) => () => {
  state.ui.selectedNode.border = border.id
}

const TopBar = () => (
  <TopBarBox>
    <InfoColumn>
      <Title>View</Title>
      <IconRow>
        <i
          className="material-icons"
          style={{
            fontSize: '28px',
            color: state.ui.componentView === ComponentView.Center ? ' rgb(83, 212, 134)' : 'black',
          }}
          onClick={selectComponentView(ComponentView.Center)}
        >
          stop
        </i>
        <i
          className="material-icons"
          style={{
            fontSize: '24px',
            marginLeft: '-2px',
            marginRight: '2px',
            transform: 'rotateZ(40deg)',
            color: state.ui.componentView === ComponentView.Tilted ? ' rgb(83, 212, 134)' : 'black',
          }}
          onClick={selectComponentView(ComponentView.Tilted)}
        >
          layers
        </i>
      </IconRow>
    </InfoColumn>

    {state.ui.selectedNode && (
      <>
        <Divider />
        <InfoColumn>
          <Title>Background</Title>
          <IconRow>
            {Object.keys(state.colors).map(colorIndex => (
              <ColorBox color={state.colors[colorIndex].hex} onClick={changeBackground(state.colors[colorIndex].id)} />
            ))}
          </IconRow>
        </InfoColumn>
        <Divider />
        <InfoColumn>
          <Title>Borders</Title>
          <IconRow>
            <BorderBox
              border={{ style: 'none', radius: 'none' }}
              selected={state.ui.selectedNode.border === null}
              onClick={removeBorder()}
            />
            {state.border.map(border => (
              <BorderBox
                selected={state.ui.selectedNode.border === border.id}
                border={border}
                onClick={changeBorder(border)}
              />
            ))}
          </IconRow>
        </InfoColumn>
      </>
    )}

    <AddComponent />
  </TopBarBox>
)

export default TopBar
