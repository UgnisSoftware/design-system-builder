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
`;

export default ({ component }: Props) => (
  <CenterComponent>
    <Component component={component} />
  </CenterComponent>
);
