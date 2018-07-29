import * as React from 'react';
import styled from 'styled-components';

import { RootNode } from '@src/interfaces';

import Component from './_Component';

interface Props {
  component: RootNode;
}

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

const ComponentWrapper = styled.div`
  flex: 0 0 auto;
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
    <svg height="auto" width="100%"  fill="#cecece" viewBox="0 0 380 156">
      <rect x="0" y="0" rx="3" ry="3" width="350" height="6.4" />
      <rect x="0" y="20" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="40" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="60" rx="3" ry="3" width="380" height="6.4" />
      <rect x="0" y="80" rx="3" ry="3" width="201" height="6.4" />
    </svg>
  </ContentLoaderWrapperBottom>
);

export default ({ component }: Props) => (
  <CenterComponent>
    <ContentTop />
    <ComponentWrapper>
      <Component component={component} />
    </ComponentWrapper>
    <ContentBottom />
  </CenterComponent>
);
