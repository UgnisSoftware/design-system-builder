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
  'exporting' = 'exporting',
  'assets' = 'assets',
}

export enum DragDirection {
  N = 'N',
  NE = 'NE',
  NW = 'NW',
  W = 'W',
  E = 'E',
  S = 'S',
  SW = 'SW',
  SE = 'SE',
}

export enum ComponentStateMenu {
  hover = 'hover',
  focus = 'focus',
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

export enum Overflow {
  visible = 'visible',
  hidden = 'hidden',
  scroll = 'scroll',
}

export enum Alignment {
  stretch = 'stretch',
  start = 'start',
  center = 'center',
  end = 'end',
}

export enum ObjectFit {
  fill = 'fill',
  contain = 'contain',
  cover = 'cover',
}

export enum ViewTypes {
  SingleCenter = 'SingleCenter',
  CenterWithTopAndBottom = 'CenterWithTopAndBottom',
  Repeaated = 'Repeaated',
}

export interface Padding {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

type Direction = number

export interface AllDirections {
  top?: Direction
  bottom?: Direction
  left?: Direction
  right?: Direction
}

export interface GridProperty {
  value: number
  unit: Units
}

interface SharedNodeProps {
  id: string
  position: {
    columnStart: number
    columnEnd: number
    rowStart: number
    rowEnd: number
  }
  alignment: {
    horizontal: Alignment
    vertical: Alignment
  }
  columns: GridProperty[]
  rows: GridProperty[]
  padding: Padding
  overflow: Overflow
}

type BorderPlaceholder = string
type BoxShadowPlaceholder = string

export interface BoxNode extends SharedNodeProps {
  type: NodeTypes.Box
  border: BorderPlaceholder
  boxShadow?: BoxShadowPlaceholder
  children: Node[]
  background: {
    colorId: string
  }
  focus: Partial<BoxNode>
  hover: Partial<BoxNode>
}
export interface TextNode extends SharedNodeProps {
  type: NodeTypes.Text
  text: string
  fontSize: FontSizeName

  focus: Partial<TextNode>
  hover: Partial<TextNode>
}
export interface InputNode extends SharedNodeProps {
  type: NodeTypes.Input
  label: string

  background: {
    colorId: string
  }
  border: BorderPlaceholder
  boxShadow: BoxShadowPlaceholder
  focus: Partial<InputNode>
  hover: Partial<InputNode>
}
export interface ImageNode extends SharedNodeProps {
  type: NodeTypes.Image
  imageUrl: string
  objectFit: ObjectFit

  //border: BorderPlaceholder
  //boxShadow: BoxShadowPlaceholder
  focus: Partial<ImageNode>
  hover: Partial<ImageNode>
}

export type Node = TextNode | BoxNode | InputNode | ImageNode

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
  id: string
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

export interface Elements {
  Button: {
    Primary: Node
    Secondary: Node
  }
  // 'Radio Buttons': GenericPlaceholderElement[]
  // 'Check Box': GenericPlaceholderElement[]

  Input: {
    'Text Input': Node
  }
  // 'Text Input': TextInputElement[]
  // 'Autocomplete Input': GenericPlaceholderElement[]
  // 'Number Input': GenericPlaceholderElement[]
  // 'Slider Input': GenericPlaceholderElement[]
  // 'Range Input': GenericPlaceholderElement[]
  // 'Dropdown Input': GenericPlaceholderElement[]
  // 'Date Picker': GenericPlaceholderElement[]

  // 'Pop-up': GenericPlaceholderElement[]
  // Sidebar: GenericPlaceholderElement[]
  // Loader: GenericPlaceholderElement[]
  // Breadcrumb: GenericPlaceholderElement[]
  // Pagination: GenericPlaceholderElement[]
  // Video: GenericPlaceholderElement[]
  // Map: GenericPlaceholderElement[]
}

export interface AddingAtom {
  type: NodeTypes
  position: {
    x: number
    y: number
  }
  imageUrl?: string
}

export interface HoveredCell {
  component: Node
  rowIndex: number
  colIndex: number
}

export interface State {
  elements: Elements
  components: { [id: string]: Component }
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  font: Font
  ui: {
    router: Router
    componentView: ComponentView
    editingColorId: string
    editingTextNode: Node
    editingBoxNode: Node
    addingComponent: boolean
    addingPage: boolean
    showAddComponentMenu: boolean
    selectedNode: Node
    expandingNode: {
      node: Node
      parent: Node
      direction: DragDirection
    }
    draggingNodePosition: {
      x: number
      y: number
    }
    addingAtom: AddingAtom
    hoveredCell: HoveredCell
    stateManager?: ComponentStateMenu
  }
}
