import * as React from "react"
import type { StoryContext } from "@storybook/react"
import { ChakraProvider, extendTheme } from "../src/react"

export const globalTypes = {
  direction: {
    name: "Direction",
    description: "Direction for layout",
    defaultValue: "LTR",
    toolbar: {
      icon: "globe",
      items: ["LTR", "RTL"],
    },
  },
}

// const withChakra = (StoryFn: Function, context: StoryContext) => {
//   const { direction } = context.globals
//   const dir = direction.toLowerCase()
//
//   return (
//     <ChakraProvider>
//       <div dir={dir} id="story-wrapper" style={{ minHeight: "100vh" }}>
//         <StoryFn />
//       </div>
//     </ChakraProvider>
//   )
// }
//
// export const decorators = [withChakra]
export const parameters = {
  layout: "padded",
}
