import * as React from 'react'
import styled from 'styled-components'
import { ElementRoutes } from '@src/interfaces/router'

const DocsWrapper = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  background: white;
`

interface Props {
  route: ElementRoutes
}

const Docs = ({ route }: Props) => <DocsWrapper>{route}</DocsWrapper>

export default Docs
