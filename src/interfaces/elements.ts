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
  Link = 'Link',
  Component = 'component',
  New = 'new',
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}

export interface Element {
  id: string
  name: string
  type: ElementType
  root: RootNode | null
  modifiers: {
    [key: string]: DeepPartial<RootNode>
  }
}
