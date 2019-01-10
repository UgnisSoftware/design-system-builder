export enum FontSizeName {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum SpacingSizeName {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum RouterPaths {
  'fonts' = 'fonts',
  'colors' = 'colors',
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
  Component = 'Component',
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

export interface Node {
  id: string
  type: NodeTypes
  text?: string
  size: {
    width: number
    height: number
  }
  position: AllDirections
  padding?: AllDirections
  margin?: AllDirections
  border?: AllDirections
  background?: {
    color: string
  }
  fontSize?: FontSizeName
}

export interface Component {
  id: string
  name: string
  viewMode: ViewTypes
  nodes: Node[]
}

export interface Page {
  id: string
  name: string
  viewMode: ViewTypes
  nodes: Node[]
}

interface Color {
  name: string
  hex: string
}

export interface BoxShadow {
  value: string
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

export interface State {
  router: Router
  components: { [id: string]: Component }
  pages: { [id: string]: Page }
  colors: { [id: string]: Color }
  spacing: { [size in SpacingSizeName]: string }
  boxShadow: BoxShadow[]
  font: Font
  ui: {
    screenPosition: {
      x: number
      y: number
    }
    componentView: ComponentView
    editingColorId: string
    editingTextNode: Node
    addingComponent: boolean
    addingPage: boolean
    showAddComponentMenu: boolean
    selectedNode: Node
    zoom: number
  }
}
