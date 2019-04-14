import { RootNode } from '@src/Interfaces/nodes'

export interface Component {
  id: string
  name: string
  root: RootNode
}

export enum ComponentView {
  Center = 'Center',
  Tilted = 'Tiled',
  CenterWithTopAndBottom = 'CenterWithTopAndBottom',
  Repeated = 'Repeated',
  WithSidebar = 'WithSidebar',
  List = 'List',
}