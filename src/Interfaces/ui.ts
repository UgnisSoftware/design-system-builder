import { Router } from '@src/Interfaces/router'
import { Nodes, NodeTypes } from '@src/Interfaces/nodes'

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
  component: Nodes
  rowIndex: number
  colIndex: number
}

export interface UI {
  router: Router
  editingColorId: string
  editingTextNode: Nodes
  editingBoxNode: Nodes
  addingComponent: boolean
  showAddComponentMenu: boolean
  selectedNode: Nodes
  expandingNode: {
    node: Nodes
    parent: Nodes
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
