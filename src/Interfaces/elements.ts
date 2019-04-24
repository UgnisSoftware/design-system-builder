import { RootNode } from '@src/Interfaces/nodes'

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

export type Elements = { [id: string]: Element }
