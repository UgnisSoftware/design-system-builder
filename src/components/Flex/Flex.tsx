import React, { FC } from 'react'

import { BoxProps, Box } from '../Box/Box'

export type FlexProps = BoxProps

export const Flex: FC<FlexProps> = ({ children, ...rest }) => (
  <Box display="flex" {...rest}>
    {children}
  </Box>
)
