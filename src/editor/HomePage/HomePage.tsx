import * as React from 'react'
import styled from 'styled-components'
import { paths, pathToUrl } from '@state/router'

const Container = styled.div`
  overflow: scroll;
  max-height: 100vh;
  padding: 64px;
  width: 100%;
`
const Top = styled.div`
  display: block;
  text-align: center;
  font-family: Roboto;
  font-size: 36px;
`
const SubTop = styled.div`
  text-align: center;
  font-size: 24px;
  font-family: Roboto;
`
const Subhead = styled.div`
  display: block;
  font-size: 20px;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: lighter;
  padding: 15px;
  border-bottom: 3px dotted #d9d9d9;
`

const HomePage = () => {
  return (
    <Container>
      <Container>
        <Top>
          <h3>Welcome to Ugnis</h3>
        </Top>
        <SubTop>A visual design tool with no CSS</SubTop>
      </Container>
      <Subhead> {'<<<'} Click on the left menu to start</Subhead>
      <h4>
        <a href={'https://github.com/masiulis/Ugnis'} target="_blank">
          Github
        </a>
      </h4>
      <h4>
        <a href={pathToUrl(paths.docs)}>Documentation</a>
      </h4>
    </Container>
  )
}

export default HomePage
