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
  'default' = 'default',
  'fonts' = 'fonts',
  'colors' = 'colors',
  'component' = 'component',
}

interface Router {
  path: RouterPaths;
  componentId?: string;
}

export enum NodeTypes {
  Root = 'Root',
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

type Direction = number | 'auto';

interface AllDirections {
  top?: Direction;
  bottom?: Direction;
  left?: Direction;
  right?: Direction;
}

export interface TextNode {
  id: string;
  type: NodeTypes.Text;
  fontSize: FontSizeName;
  text: 'Hello';
  position?: AllDirections
}

export interface BoxNode {
  id: string;
  type: NodeTypes.Box;
  size: {
    width: number | 'auto';
    height: number | 'auto';
  };
  position: AllDirections;
  padding?: AllDirections;
  margin?: AllDirections;
  border?: AllDirections;
  background?: {
    color: string;
  };
  children: AnyNode[];
}

export interface RootNode {
  id: string;
  type: NodeTypes.Root;
  size: {
    width: number | 'auto';
    height: number | 'auto';
  };
  position: AllDirections;
  padding?: AllDirections;
  margin?: AllDirections;
  border?: AllDirections;
  background?: {
    color: string;
  };
  children: AnyNode[];
}

export type AnyNode = RootNode | BoxNode | TextNode;

export interface Component {
  name: string;
  viewMode: ViewTypes;
  selectedNode: string;
  root: RootNode;
}

interface Color {
  name: string;
  hex: string;
}

interface FontSize {
  fontSize: string;
  lineHeight: string;
}

interface Font {
  fontName: string;
  fontUrl: string;
  sizes: { [size in FontSizeName]: FontSize };
}

export enum ComponentView {
  Center = 'Center',
  CenterWithTopAndBottom = 'CenterWithTopAndBottom',
  Repeated = 'Repeated',
  WithSidebar = 'WithSidebar',
  List = 'List',
}

export interface State {
  router: Router;
  components: { [id: string]: Component };
  colors: { [id: string]: Color };
  spacing: { [size in SpacingSizeName]: string };
  font: Font;
  ui: {
    componentView: ComponentView;
    editingColorId: string;
    editingTextNode: boolean;
    addingComponent: boolean;
    selectedNodeId: string;
  };
}
