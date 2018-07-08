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

export interface Node {
  id: string;
  type: NodeTypes;
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
  children: Node[];
}

export interface Component {
  name: string;
  viewMode: ViewTypes;
  selectedNode: string;
  root: Node;
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

export interface State {
  router: Router;
  components: { [id: string]: Component };
  colors: { [id: string]: Color };
  editingColorId: string;
  spacing: { [size in SpacingSizeName]: string };
  font: Font;
}
