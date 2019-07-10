import { Nodes, RootNode } from '@src/interfaces/nodes'
import { RouterPaths } from '@src/interfaces/router'
import { ElementType } from '@src/interfaces/elements'

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

export type ComponentStateMenu = string

export interface AddingAtom {
  node: Nodes
  x: number
  y: number
}

export interface HoveredCell {
  component: RootNode
  rowIndex: number
  colIndex: number
}

export interface UI {
  router: (RouterPaths | ElementType)[]
  editingColorId: string
  editingTextNode: Nodes
  addingElement: ElementType | null
  showAddComponentMenu: boolean
  showExportMenu: boolean
  showGrid: boolean
  selectedNode: Nodes
  selectedNodeToOverride: Nodes
  expandingNode: {
    node: Nodes
    parent: RootNode
    direction: DragDirection
  }
  draggingNode: AddingAtom
  addingAtom: AddingAtom
  hoveredCell: HoveredCell
  selectedCell: HoveredCell
  stateManager: ComponentStateMenu
}
