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
`;

export default () => (
  <Center>
    <TopBar />
    <Preview />
  </Center>
);
