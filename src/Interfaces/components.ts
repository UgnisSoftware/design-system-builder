import { RootNode } from '@src/Interfaces/nodes'

export interface Component {
  id: string
  name: string
  root: RootNode
}

export type Components = { [id: string]: Component }
