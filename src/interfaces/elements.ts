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

export interface Elements {
  Buttons: {
    Primary: RootNode // text overridable background overridable
    Secondary: RootNode // text overridable background overridable
    Tertiary: RootNode // text overridable background overridable
    Icon: RootNode // Icon overridable, background overridable
  }

  Inputs: {
    'Text Input': RootNode
    'Number Input': RootNode // React number format
    'Autocomplete Input': RootNode
    'Autocomplete Dropdown': RootNode
    'Select Input': RootNode // React Select
    'Select Dropdown': RootNode // React Select
    'Slider Input': RootNode
    'Range Input': RootNode
    'Radio Buttons': RootNode
    'Check Box': RootNode
    'Date Picker Input': RootNode
    'Date Picker Dropdown': RootNode
  }

  Popups: {
    Sidebar: RootNode
    Popup: RootNode
    Tooltip: RootNode
  }

  Loaders: {
    Spinner: RootNode
  }
  Tables: {}
  // Breadcrumb: GenericPlaceholderElement[]
  // Pagination: GenericPlaceholderElement[]
  // Video: GenericPlaceholderElement[]
  // Map: GenericPlaceholderElement[]
}

export interface ElementProxies {
  elements: string[]
}
