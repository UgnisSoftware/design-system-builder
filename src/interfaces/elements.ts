import { RootNode } from '@src/interfaces/nodes'

export enum ElementTypes {
  Button = 'Button',
  Input = 'Input',
  Slider = 'SlideInput',
  Dropdown = 'Dropdown',
  DatePicker = 'DatePicker',
  Popup = 'Popup',
  Sidebar = 'Sidebar',
  Loader = 'Loader',
  Breadcrumb = 'Breadcrumb',
  Pagination = 'Pagination',
  Video = 'Video',
  Map = 'Map',
}

export interface Element {
  id: string
  name: string
  type: ElementTypes
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
