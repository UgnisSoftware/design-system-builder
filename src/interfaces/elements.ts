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
  buttons: Element[]
  textInputs: Element[]
  dropdowns: Element[]
  autocomplete: Element[]
  select: Element[]
  slider: Element[]
  range: Element[]
  radio: Element[]
  checkBox: Element[]
  datePicker: Element[]
  sidebar: Element[]
  popup: Element[]
  tooltip: Element[]
  loaders: Element[]
  tables: Element[]
  components: Element[]
}
