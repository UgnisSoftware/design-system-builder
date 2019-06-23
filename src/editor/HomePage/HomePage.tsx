import * as React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  overflow: scroll;
  max-height: 100vh;
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
        <Top>
          <h3>Welcome to Ugnis</h3>
        </Top>
        <SubTop>A visual design tool with no CSS</SubTop>
      </Container>
      <Subhead>Click on the left menu to start</Subhead>
      <Subhead>How to setup</Subhead>
      <Content>Setup - `npm i --save ugnis`, `ugnis open` or `ugnis compile`</Content>
      <Subhead>Ugnis as component library</Subhead>
      <Subhead>Ugnis as CSS generator</Subhead>
      What is Ugnis Ugnis is a visual CSS development tool, which utilizes grid layout in order to allow users to
      generate custom components and pages which are then exported into a framework of their choice. No longer do you
      have to think about complex layouts and predict stylistic choices in your code - by simply using Ugnis, you can
      avoid common CSS ‘gotchas’ and typing hundreds of lines of code. Simply drag and drop your elements, components
      and other items to your grid in order to create your perfect and usable layout. Who should use it The tool was
      intended to be used by developers, who are simply tired of thinking about their visual designs in plain text,
      however, virtually anyone can use it to create custom designs which are then usable in code. There are many tools
      out there, that help with the process of creating designs, however, they are either too convoluted, do not export
      to proper frameworks and are too narrow, or take time to learn and do not solve the problem of writing code. Ugnis
      is fast, simple, supports many frameworks (with more on the way) and actually reduces the need to type out code.
      The goal is to make a developers life easier while enforcing consistent and quick designs, which you can easily
      edit in minutes. How to use it Click on the left menu in order to begin using Ugnis visual tool. Selected section
      will allow you to edit the preview of your choice. Once you’re in the selected section, you can select grid
      preview mode *insert grid icon*? In order to edit the CSS grid. To edit the grid, simply select the bars at the
      top or left side of the grid in order to control their sizing, or click the *plus icon* to add new rows or
      columns. In order to insert items into the grid layout, click the *icon* at the top left side of the preview
      screen. Select the items you wish to insert from the dropdown menu and simply drag and drop them into your CSS
      grid layout. Items inside the grid layout can be edited by selecting the item, then adding styling options from
      the top-bar to the selected item. Depending on the type of selected item, it’s options may differ. I.e. a box does
      not need a font, but a string atom does. The top-bar options are customizable by accessing the “styles” section of
      the sidebar. In there you can change the default options like colors, font-size and spacing. Note that the tool
      tries to enforce the use of fewer options, simply to promote consistency in your designs. In short, the 3 main
      steps in creating your designs are: 1. Set up your grid layout - it’s the main building block of your design. 2.
      Drag and drop desired items into your element, component or page layouts. 3. Customize your items by selecting
      them individually and changing their style at the top bar, based on your settings. It is also important to
      mention, that the items in Ugnis follow a certain hierarchy: atoms > elements > components > pages Each of these
      structures are unique in scale and application, you can view them as parent to child structure, except usually the
      lower level parts will not inherit styling from the parent component, meaning that the elements you created will
      always stay the same, unless you manually change them in your pages/components and so on. To define better: Atoms
      - they are the lowest level structure that cannot be altered by default. Atoms like strings, boxes, icons and
      others are the smallest building blocks of your design and can be inserted in all other levels. Elements -
      elements consist of combinations of atoms and serve a purpose. For example, buttons are usually built from box,
      text and icon atoms, and has the intended ‘do something when pressed’ functionality in mind (the functionality is
      added via your code, not in Ugnis visual tool). Components - contains a mixture of both components and atoms,
      usually bigger in scale it serves more purpose in their functionality, they hold more information and
      functionality than elements. Pages - the end product of your design, this is usually the result that the user is
      able to see and contains all the previously named structures. A website or web app usually consists of multiple
      pages that the user can navigate between. Finishing the product Once you’ve completed your first design draft, you
      may export your products to be used in your own code. It is key that you name all the elements, components and
      pages beforehand in Ugnis though, as this will allow you to easily identify the items built in Ugnis to be used in
      your code. Once exported, functionality, navigation and other features can be added to the items on demand, and
      you may publish your product online. Features: CSS Grid - Ugnis works on the modern web-design philosophies and
      utilizes CSS Grid at it’s core. Grid layout allows
    </Container>
  )
}

export default HomePage
