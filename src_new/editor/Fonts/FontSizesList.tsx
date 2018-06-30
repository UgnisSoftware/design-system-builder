import * as React from 'react';

import FontSizeRow from './FontSizeRow';
import { FontSizeName } from '../../interfaces';

const FontSizesList = () => (
  <div className="font-sizes-list">
    <FontSizeRow fontSizeName={FontSizeName.XS} />
    <FontSizeRow fontSizeName={FontSizeName.S} />
    <FontSizeRow fontSizeName={FontSizeName.M} />
    <FontSizeRow fontSizeName={FontSizeName.L} />
    <FontSizeRow fontSizeName={FontSizeName.XL} />
  </div>
);

export default FontSizesList;
