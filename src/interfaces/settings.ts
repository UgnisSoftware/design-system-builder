export type FontSizeName = 'XS' | 'S' | 'M' | 'L' | 'XL'

interface FontSize {
  fontSize: string
  lineHeight: string
}

export interface Font {
  fontFamily: string
  fontUrl: string
  id: string
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

export interface ImageAsset {
  id: string
  url: string
}

export interface Settings {
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  fonts: Font[]
  images: ImageAsset[]
}
