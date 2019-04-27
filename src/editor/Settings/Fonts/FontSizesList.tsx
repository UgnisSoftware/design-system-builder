import * as React from 'react'

import FontSizeRow from './FontSizeRow'
import { FontSizeName } from '../../../interfaces/styles'

const FontSizesList = () => (
  <>
    <FontSizeRow fontSizeName={FontSizeName.XS} />
    <FontSizeRow fontSizeName={FontSizeName.S} />
    <FontSizeRow fontSizeName={FontSizeName.M} />
    <FontSizeRow fontSizeName={FontSizeName.L} />
    <FontSizeRow fontSizeName={FontSizeName.XL} />
  </>
)

export default FontSizesList
