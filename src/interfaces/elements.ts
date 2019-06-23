import { RootNode } from '@src/interfaces/nodes'

export enum ElementType {
  Button = 'button',
  Label = 'label',
  TextInput = 'TextInput',
  Select = 'select',
  Slider = 'slider',
  Radio = 'radio',
  CheckBox = 'checkBox',
  DatePicker = 'datePicker',
  Sidebar = 'sidebar',
  Popup = 'popup',
  Tooltip = 'tooltip',
  Loader = 'loader',
  Table = 'table',
  Component = 'component',
  New = 'new',
}

export interface Element {
  id: string
  name: string
  type: ElementType
  root: RootNode | null
}
