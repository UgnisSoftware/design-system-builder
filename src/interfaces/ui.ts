import { Nodes, NodeTypes, RootNode } from '@src/interfaces/nodes'
import { RouterPaths } from '@src/interfaces/router'
import { Elements } from '@src/interfaces/elements'

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

export interface AddingAtom {
  type: NodeTypes
  position: {
    x: number
    y: number
  }
  imageUrl?: string
}

export interface HoveredCell {
  component: RootNode
  rowIndex: number
  colIndex: number
}

export interface UI {
  router: RouterPaths[]
  editingColorId: string
  editingTextNode: Nodes
  editingBoxNode: Nodes
  addingComponent: boolean
  addingElement: keyof Elements | null
  showAddComponentMenu: boolean
  showGrid: boolean
  selectedNode: Nodes
  selectedNodeToOverride: Nodes
  expandingNode: {
    node: Nodes
    parent: RootNode
    direction: DragDirection
  }
  draggingNodePosition: {
    x: number
    y: number
  }
  addingAtom: AddingAtom
  hoveredCell: HoveredCell
  selectedCell: HoveredCell
  stateManager?: ComponentStateMenu
}
