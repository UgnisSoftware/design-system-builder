import * as React from "react"
import { ChakraProvider, extendTheme } from "../../../react"
import { Text } from "../src"

export default {
  title: "Text",
}

const customTheme = extendTheme({
  components: {
    Text: {
      variants: {
        customCaps: {
          textTransform: "uppercase",
        },
      },
    },
  },
})

// see https://github.com/chakra-ui/chakra-ui/issues/2464
export const withVariant = () => (
  <ChakraProvider theme={customTheme}>
    <Text variant={"customCaps" as any}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, sapiente.</Text>
  </ChakraProvider>
)

// see https://github.com/chakra-ui/chakra-ui/issues/2464
export const overrideVariant = () => (
  <ChakraProvider theme={customTheme}>
    <Text variant={"customCaps" as any} textTransform="lowercase">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, sapiente.
    </Text>
  </ChakraProvider>
)

export const variants = () => (
  <Text size={"paragraph"} variant={"h3"}>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, sapiente.
  </Text>
)
