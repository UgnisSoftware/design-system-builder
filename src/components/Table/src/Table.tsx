import { forwardRef, ThemingProps, HTMLChakraProps } from "~/system"
import { __DEV__ } from "~/utils"
import * as React from "react"

export interface TableOptions {}

export interface TableProps extends TableOptions, ThemingProps<"Table"> {}

export const Table = forwardRef<TableProps, "div">((props, ref) => {
  return null
})

if (__DEV__) {
  Table.displayName = "Table"
}
