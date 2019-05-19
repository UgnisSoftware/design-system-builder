import { RootNode } from '@src/interfaces/nodes'

export interface Element {
  id: string
  name: string
  root: RootNode
}

//export type Elements = { [id: string]: Element }

/*
 * Elements
 *
 */

// const Buttons: Element[] = [
//   {
//     id: '1233345',
//     name: 'Primary',
//     type: ElementTypes.Breadcrumb,
//     root: {
//       id: '1233',
//
//     },
//   },
// ]

export interface Elements {
  Buttons: Element[]
  TextInputs: Element[]
  Autocomplete: Element[]
  Select: Element[]
  Slider: Element[]
  Range: Element[]
  Radio: Element[]
  CheckBox: Element[]
  DatePicker: Element[]
  Sidebar: Element[]
  Popup: Element[]
  Tooltip: Element[]
  Loaders: Element[]
  Tables: Element[]
}
