import * as React from 'react';
import { RootNode } from '@src/interfaces';
import styled from 'styled-components';
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

const ContentTop = styled.div`
  flex: 1;
  background: rgba(0,0,0, 0.25);
  width: 100%;
`;
const ContentBottom = styled.div`
  flex: 1;
  background: rgba(0,0,0, 0.25);
  width: 100%;
`;

export default ({ component }: Props) => (
  <CenterComponent>
    <ContentTop />
    <Component component={component} />
    <ContentBottom />
  </CenterComponent>
);
