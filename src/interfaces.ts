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

export interface Nodes {
  type: NodeTypes.Root;
}

export interface RootNode {
  type: NodeTypes.Root;
  width: number | 'auto';
  height: number | 'auto';
  nodes: Nodes[]
}

export interface Component {
  name: string;
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

export interface State {
  router: Router;
  components: { [id: string]: Component };
  componentList: string[];
  colors: { [id: string]: Color };
  editingColorId: string;
  spacing: { [size in SpacingSizeName]: string };
  font: Font;
}
