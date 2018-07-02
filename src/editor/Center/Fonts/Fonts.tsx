import * as React from 'react';

import store from '@state';
import FontSizesList from './FontSizesList';

const FontsPage = () => (
  <>
    <h1>Fonts</h1>
    <h2>{store.state.font.fontName}</h2>
    <FontSizesList />
  </>
);

export default FontsPage;
