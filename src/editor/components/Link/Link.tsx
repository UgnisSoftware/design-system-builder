import * as React from 'react'
import stateUi from '@state/ui'
import { parseUrl } from '@src/utils'
import styled from 'styled-components'

const onLinkClick = (href: string) => e => {
  e.preventDefault()
  history.pushState(null, '', `${href}`)
  stateUi.router = parseUrl()
}

const A = styled.a`
  text-decoration: none;
`

const Link = ({ children, ...props }: React.AnchorHTMLAttributes<{}>) => (
  <A {...props} onClick={onLinkClick(props.href)}>
    {children}
  </A>
)

export default Link
