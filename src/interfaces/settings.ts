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
  url: string
}

export interface Assets {
  images: ImageAsset
}

export interface Settings {
  colors: Color[]
  spacing: string[]
  boxShadow: BoxShadow[]
  border: Border[]
  fonts: Font[]
  assets: Assets
}
