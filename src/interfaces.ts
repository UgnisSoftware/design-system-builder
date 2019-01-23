export enum FontSizeName {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum RouterPaths {
  'fonts' = 'fonts',
  'colors' = 'colors',
  'elements' = 'elements',
  'component' = 'component',
  'page' = 'page',
}

interface Router {
  path: RouterPaths
  componentId?: string
}

export enum NodeTypes {
  Box = 'Box',
  Text = 'Text',
  Input = 'Input',
  Image = 'Image',
  Button = 'Button',
  Link = 'Link',
  Component = 'Component',
}

export enum Units {
  Fr = 'fr',
  Px = 'px',
  Auto = 'Auto',
}

export enum ViewTypes {
  SingleCenter = 'SingleCenter',
  CenterWithTopAndBottom = 'CenterWithTopAndBottom',
  Repeaated = 'Repeaated',
}

type Direction = number

interface AllDirections {
  top?: Direction
  bottom?: Direction
  left?: Direction
  right?: Direction
}

interface GridProperty {
  value: number
  unit: Units
}

export interface Node {
  id: string
  type: NodeTypes
  text?: string
  position: {
    columnStart: number
    columnEnd: number
    rowStart: number
    rowEnd: number
  }
  columns: GridProperty[]
  rows: GridProperty[]
  padding?: AllDirections
  margin?: AllDirections
  border?: string
  background?: {
    colorId: string
  }
  children: Node[]
  fontSize?: FontSizeName
}

export interface Component {
  id: string
  name: string
  viewMode: ViewTypes
  root: Node
}

export interface Page {
  id: string
  name: string
  viewMode: ViewTypes
  root: Node
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface BoxShadow {
  value: string
}

export interface Border {
  id: string
  style: string
  radius: string
}

interface FontSize {
  fontSize: string
  lineHeight: string
}

interface Font {
  fontName: string
  fontUrl: string
  sizes: { [size in FontSizeName]: FontSize }
}

export enum ComponentView {
  Center = 'Center',
  Tilted = 'Tiled',
  CenterWithTopAndBottom = 'CenterWithTopAndBottom',
  Repeated = 'Repeated',
  WithSidebar = 'WithSidebar',
  List = 'List',
}

interface Button {
  name: string
  root: Node
}

export interface Elements {
  Button: Button[]
}

export interface AddingAtom {
  type: NodeTypes
  position: {
    x: number
    y: number
  }
}

export interface HoveredCell {
  component: Node
  rowIndex: number
  colIndex: number
}

export interface State {
  router: Router
  elements: Elements
  components: { [id: string]: Component }
  pages: { [id: string]: Page }
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  font: Font
  ui: {
    componentView: ComponentView
    editingColorId: string
    editingTextNode: Node
    addingComponent: boolean
    addingPage: boolean
    showAddComponentMenu: boolean
    selectedNode: Node
    zoom: number
    addingAtom: AddingAtom
    hoveredCell: HoveredCell
    showGrid: boolean
  }
}
