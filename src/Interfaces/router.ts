export enum RouterPaths {
  'fonts' = 'fonts',
  'colors' = 'colors',
  'elements' = 'elements',
  'component' = 'component',
  'exporting' = 'exporting',
  'assets' = 'assets',
}

export interface Router {
  path: RouterPaths
  componentId?: string
}
