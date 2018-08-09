import * as React from 'react';
import styled from 'styled-components';
import state from '@state';
import Center from './ComponentView/CenterComponent';
import CenterWithTopAndBottom from './ComponentView/CenterWithTopAndBottom';
import Repeated from './ComponentView/Repeated';
import { ComponentView } from '@src/interfaces';
import AddComponentMenu from './AddComponentMenu/AddComponentMenu';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
`;

interface Props {
  sidebarOpen: boolean;
}

const Preview = styled.div`
  flex: 1;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
  display: flex;
    filter: ${(props: Props) => (props.sidebarOpen ? 'blur(10px) saturate(0.8)' : 'none')};
`;

export default () => {
  const component = state.state.components[state.state.router.componentId];
  return (
    <Wrapper>
      <Preview sidebarOpen={state.state.ui.showAddComponentMenu}>
        {state.state.ui.componentView === ComponentView.Center && <Center component={component.root} />}
        {state.state.ui.componentView === ComponentView.CenterWithTopAndBottom && (
          <CenterWithTopAndBottom component={component.root} />
        )}
        {state.state.ui.componentView === ComponentView.Repeated && <Repeated component={component.root} />}
      </Preview>
        {state.state.ui.showAddComponentMenu && <AddComponentMenu />}
    </Wrapper>
  );
};
