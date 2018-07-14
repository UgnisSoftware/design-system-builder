import * as React from 'react';
import styled from 'styled-components';
import state from '@state';
import { ComponentView } from '@src/interfaces';

const TopBar = styled.div`
  padding: 8px 22px;
  background: rgb(0, 0, 0, 0.028);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  font-size: 24px;
`;

const Divider = styled.div`
  width: 3px;
  height: 85%;
  flex: 0 0 2px;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 4px;
`;

const selectComponentView = (view: ComponentView) => () => {
  state.evolveState({
    ui: {
      componentView: () => view,
    },
  });
};

export default () => (
  <TopBar>
    <i className="material-icons">add_circle_outline</i>
    <i className="material-icons">flip_to_back</i>
    <i className="material-icons">flip_to_front</i>
    <Divider />
    <i
      className="material-icons"
      style={{
        fontSize: '28px',
        color: state.state.ui.componentView === ComponentView.Center ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.Center)}
    >
      stop
    </i>
    <i
      className="material-icons"
      style={{
        fontSize: '27px',
        marginRight: '4px',
        color: state.state.ui.componentView === ComponentView.CenterWithTopAndBottom ? ' rgb(83, 212, 134)' : 'black',
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
        color: state.state.ui.componentView === ComponentView.WithSidebar ? ' rgb(83, 212, 134)' : 'black',
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
        color: state.state.ui.componentView === ComponentView.Repeated ? ' rgb(83, 212, 134)' : 'black',
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
        color: state.state.ui.componentView === ComponentView.List ? ' rgb(83, 212, 134)' : 'black',
      }}
      onClick={selectComponentView(ComponentView.List)}
    >
      view_stream
    </i>
    <Divider />
    <i className="material-icons">settings</i>
  </TopBar>
);
