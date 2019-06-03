import * as React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  padding: 64px;
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
const Content = styled.div`
  display: block;
  padding-top: 5px;
  align-self: auto;
`

const HomePage = () => {

  return (
    <Container>
      <Container>
        <Top><h3>Welcome to Ugnis</h3></Top>
        <SubTop>A visual design tool with no CSS</SubTop>
      </Container>
      <Subhead>Click on the left menu to start</Subhead>
      <Subhead>How to setup</Subhead>
      <Content>Setup - `npm i --save ugnis`, `ugnis open` or `ugnis compile`</Content>
      <Subhead>Ugnis as component library</Subhead>
      <Subhead>Ugnis as CSS generator</Subhead>
    </Container>
  )
}

export default HomePage
