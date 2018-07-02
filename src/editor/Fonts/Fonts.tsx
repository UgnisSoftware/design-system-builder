import * as React from 'react';

import store from '@state';
import FontSizesList from './FontSizesList';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
`;
const H1 = styled.h1`
  padding-bottom: 8px;
  border-bottom: 3px dotted #d9d9d9;
`;

const FontsPage = () => (
  <Wrapper>
    <H1>Fonts</H1>
    <h2>{store.state.font.fontName}</h2>
    <FontSizesList />
  </Wrapper>
);

export default FontsPage;
