import { lape } from 'lape'
import { UI } from '@src/interfaces/ui'

const defaultState: UI = {
  editingColorId: '',
  editingTextNode: null,
  addingElement: null,
  draggingNode: null,
  addingAtom: null,
  hoveredCell: null,
  selectedCell: null,
  selectedNode: null,
  selectedNodeToOverride: null,
  expandingNode: null,
  stateManager: null,
  showAddComponentMenu: false,
  showExportMenu: false,
  showGrid: false,
  zoom: 100,
  tilted: false,
}

export default lape(defaultState)
