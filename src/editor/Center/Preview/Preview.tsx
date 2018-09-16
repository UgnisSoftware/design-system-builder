import * as React from 'react';
import styled from 'styled-components';
import state from '@state';
import { ComponentView } from '@src/interfaces';
import AddComponentMenu from './AddComponentMenu/AddComponentMenu';
import Component from '@src/editor/Center/Preview/ComponentView/_Component';
import {view} from "react-easy-state/dist/es.es6";

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
  overflow: auto;
  perspective: 1000px;
`;

const CenterComponent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ContentLoaderWrapperTop = styled.div`
  flex: 1 1 auto;
  display: flex;
  width: 80%;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
`;

const ContentLoaderWrapperBottom = styled(ContentLoaderWrapperTop)`
  justify-content: flex-start;
`;

const ContentTop = () => (
  <ContentLoaderWrapperTop>
    <svg height="auto" width="100%" fill="#cecece" viewBox="0 0 380 156">
      <rect x="70" y="45" rx="4" ry="4" width="117" height="6.4" />
      <rect x="70" y="65" rx="3" ry="3" width="85" height="6.4" />
      <rect x="0" y="110" rx="3" ry="3" width="350" height="6.4" />
      <rect x="0" y="130" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="150" rx="3" ry="3" width="201" height="6.4" />
      <circle cx="30" cy="60" r="30" />
    </svg>
  </ContentLoaderWrapperTop>
);

const ContentBottom = () => (
  <ContentLoaderWrapperBottom>
    <svg height="auto" width="100%" fill="#cecece" viewBox="0 0 380 156">
      <rect x="0" y="0" rx="3" ry="3" width="350" height="6.4" />
      <rect x="0" y="20" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="40" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="60" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="80" rx="3" ry="3" width="201" height="6.4" />
    </svg>
  </ContentLoaderWrapperBottom>
);

export default view(() => {
  const component = state.components[state.router.componentId];
  const showTopAndBottom = state.ui.componentView === ComponentView.CenterWithTopAndBottom;
  const showRepeated = state.ui.componentView === ComponentView.Repeated;
  return (
    <Wrapper>
      <Preview sidebarOpen={state.ui.showAddComponentMenu}>
        {showTopAndBottom && <ContentTop />}
        <CenterComponent>
          {showRepeated && <Component component={component.root} />}
          <Component component={component.root} />
          {showRepeated && <Component component={component.root} />}
        </CenterComponent>
        {showTopAndBottom && <ContentBottom />}
      </Preview>
      {state.ui.showAddComponentMenu && <AddComponentMenu />}
    </Wrapper>
  );
});
