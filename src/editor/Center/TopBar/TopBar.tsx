import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Border, ComponentView } from '@src/interfaces'

const TopBarBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 22px;
  background: rgb(248, 248, 248);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  font-size: 24px;
  user-select: none;
`

const Divider = styled.div`
  width: 3px;
  height: 85%;
  flex: 0 0 2px;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 4px;
`

const ColorBox = styled.div`
  width: 24px;
  height: 24px;
  background: ${({ color }: any) => color};
  cursor: pointer;
`

const BorderBox = styled.div`
  border: ${({ border }) => border.style};
  border-radius: ${({ border }) => border.radius};
  background: white;
  margin-right: 8px;
  width: 25px;
  height: 25px;
`

const GridBox = styled.div`
  border: #565656 dashed 1px;
  background: white;
  margin-right: 8px;
  width: 25px;
  height: 25px;
  cursor: pointer;
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

const flipShowGrid = () => {
  state.ui.showGrid = !state.ui.showGrid
}

const TopBar = () => (
  <TopBarBox>


    <Divider />

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
    <GridBox onClick={flipShowGrid} />
    <Divider />

    {state.ui.selectedNode && (
      <>
        <Divider />
        {Object.keys(state.colors).map(colorIndex => (
          <ColorBox color={state.colors[colorIndex].hex} onClick={changeBackground(state.colors[colorIndex].id)} />
        ))}
        <Divider />
        <BorderBox border={{ style: 'none', radius: 'none' }} onClick={removeBorder()} />
        {state.border.map(border => (
          <BorderBox border={border} onClick={changeBorder(border)} />
        ))}
      </>
    )}
  </TopBarBox>
)

export default TopBar
