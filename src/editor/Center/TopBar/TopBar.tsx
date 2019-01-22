import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { ComponentView } from '@src/interfaces'

const TopBarBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 22px;
  background: rgb(248,248,248);
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

const selectComponentView = (view: ComponentView) => () => {
  state.ui.componentView = view
}

const showAddComponentMenu = () => {
  state.ui.showAddComponentMenu = !state.ui.showAddComponentMenu
}

const changeBackground = (colorId: string) => () => {
  state.ui.selectedNode.background.colorId = colorId
}

const TopBar = () => (
  <TopBarBox>
    <i className="material-icons" onClick={showAddComponentMenu}>
      {state.ui.showAddComponentMenu ? 'remove_circle_outline' : 'add_circle_outline'}
    </i>
    <i className="material-icons">flip_to_back</i>
    <i className="material-icons">flip_to_front</i>
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
    <i
      className="material-icons"
      style={{
        fontSize: '27px',
        marginRight: '4px',
        color: state.ui.componentView === ComponentView.CenterWithTopAndBottom ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.CenterWithTopAndBottom)}
    >
      view_quilt
    </i>
    <i
      className="material-icons"
      style={{
        fontSize: '24px',
        marginRight: '4px',
        color: state.ui.componentView === ComponentView.WithSidebar ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.WithSidebar)}
    >
      vertical_split
    </i>
    <i
      className="material-icons"
      style={{
        fontSize: '27px',
        marginRight: '4px',
        color: state.ui.componentView === ComponentView.Repeated ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.Repeated)}
    >
      view_column
    </i>
    <i
      className="material-icons"
      style={{
        fontSize: '27px',
        marginRight: '4px',
        color: state.ui.componentView === ComponentView.List ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.List)}
    >
      view_stream
    </i>
    <Divider />
    <i className="material-icons">settings</i>
    {Object.keys(state.colors).map(colorIndex => (
      <ColorBox color={state.colors[colorIndex].hex} onClick={changeBackground(state.colors[colorIndex].id)} />
    ))}
  </TopBarBox>
)

export default TopBar
