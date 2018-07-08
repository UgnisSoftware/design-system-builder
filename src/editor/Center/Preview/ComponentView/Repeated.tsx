import * as React from 'react';
import { Node } from '@src/interfaces';
import styled from 'styled-components';
import Component from './_Component';

interface Props {
  component: Node;
}

const CenterComponent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
`;

export default ({ component }: Props) => (
  <CenterComponent>
    <Row>
      <Component component={component} />
      <Component component={component} />
      <Component component={component} />
    </Row>
  </CenterComponent>
);
