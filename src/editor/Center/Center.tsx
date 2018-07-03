import * as React from 'react';
import styled from 'styled-components';

import TopBar from './TopBar/TopBar';

const Center = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  flex: 1 1 auto;
`;
const Preview = styled.div`
  margin: 16px 0;
  flex: 1;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
`;

export default () => (
  <Center>
    <TopBar />
    <Preview />
  </Center>
);
