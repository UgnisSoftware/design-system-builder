export enum FontSizeName {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
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

export interface BoxShadow {
  id: string
  value: string
}

export interface Border {
  id: string
  style: string
  radius: string
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface Styles {
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  font: Font
}
