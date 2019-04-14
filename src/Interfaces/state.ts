import { FontSizeName } from '@src/Interfaces/fonts'
import { UI } from '@src/Interfaces/ui'
import { Elements } from '@src/Interfaces/elements'
import { Component } from '@src/Interfaces/components'

export interface BoxShadow {
  id: string
  value: string
}

export interface Border {
  id: string
  style: string
  radius: string
}

interface FontSize {
  fontSize: string
  lineHeight: string
}

export interface Font {
  fontName: string
  fontUrl: string
  sizes: { [size in FontSizeName]: FontSize }
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface State {
  elements: Elements
  components: { [id: string]: Component }
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  font: Font
  ui: UI
}
