import { RootNode } from '@src/interfaces/nodes'

export enum ElementType {
  Button = 'button',
  TextInput = 'TextInput',
  Dropdown = 'Dropdown',
  Autocomplete = 'Autocomplete',
  Select = 'Select',
  Slider = 'Slider',
  Range = 'Range',
  Radio = 'Radio',
  CheckBox = 'CheckBox',
  DatePicker = 'DatePicker',
  Sidebar = 'Sidebar',
  Popup = 'Popup',
  Tooltip = 'Tooltip',
  Loader = 'Loader',
  Table = 'Table',
  Component = 'Component',
  New = 'New',
}

export interface Element {
  id: string
  name: string
  type: ElementType
  root: RootNode | null
}
