export interface Column<Data> {
  key: string
  name: string
  width: number
  fixed?: boolean
  resizable?: boolean
}
