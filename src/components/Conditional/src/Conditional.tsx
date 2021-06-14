import React from "react"

type Props = {
  condition: boolean
  children: React.ReactElement
  wrap: (children: React.ReactNode) => JSX.Element
}

export const Conditional = ({ condition, children, wrap }: Props) =>
  condition ? React.cloneElement(wrap(children)) : children
