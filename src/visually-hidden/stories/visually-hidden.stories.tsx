import * as React from "react"
import { VisuallyHidden, VisuallyHiddenInput } from "../src"

export default {
  title: "Utils/Visually Hidden",
}

export const hiddenSpan = () => <VisuallyHidden>This is visually hidden</VisuallyHidden>

export const hiddenInput = () => (
  <VisuallyHiddenInput
    defaultChecked
    onChange={(event: any) => {
      console.log(event.target.checked)
    }}
  />
)
