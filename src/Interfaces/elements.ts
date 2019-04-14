import { RootNode } from '@src/Interfaces/nodes'

export interface Elements {
  Button: {
    Primary: RootNode
    Secondary: RootNode
  }
  // 'Radio Buttons': GenericPlaceholderElement[]
  // 'Check Box': GenericPlaceholderElement[]

  Input: {
    'Text Input': RootNode
  }
  Dropdown: {
    default: {
      input: RootNode
      menu: RootNode
    }
  }
  // 'Text Input': TextInputElement[]
  // 'Autocomplete Input': GenericPlaceholderElement[]
  // 'Number Input': GenericPlaceholderElement[]
  // 'Slider Input': GenericPlaceholderElement[]
  // 'Range Input': GenericPlaceholderElement[]
  // 'Dropdown Input': GenericPlaceholderElement[]
  // 'Date Picker': GenericPlaceholderElement[]

  // 'Pop-up': GenericPlaceholderElement[]
  // Sidebar: GenericPlaceholderElement[]
  // Loader: GenericPlaceholderElement[]
  // Breadcrumb: GenericPlaceholderElement[]
  // Pagination: GenericPlaceholderElement[]
  // Video: GenericPlaceholderElement[]
  // Map: GenericPlaceholderElement[]
}
