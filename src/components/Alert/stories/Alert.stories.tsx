import { chakra } from "~/system"
import * as React from "react"
import { Alert, AlertCloseButton, AlertDescription, AlertIcon, AlertTitle } from "../src"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"

export default {
  title: "Alert",
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = () => (
  <Alert status="error">
    <AlertIcon />
    <AlertTitle mr={2}>Outdated</AlertTitle>
    <AlertDescription>Your Chakra experience may be degraded.</AlertDescription>
    <AlertCloseButton />
  </Alert>
)

export const Subtle = () => (
  <Alert status="warning" mx="auto" alignItems="start">
    <AlertIcon />
    <chakra.div flex="1">
      <AlertTitle>Holy Smokes</AlertTitle>
      <AlertDescription>Something just happened!</AlertDescription>
    </chakra.div>
    <AlertCloseButton />
  </Alert>
)

export const LeftAccent = () => (
  <Alert mx="auto" alignItems="start">
    <AlertIcon />
    <chakra.div flex="1">
      <AlertTitle>Holy Smokes</AlertTitle>
      <AlertDescription>Something just happened!</AlertDescription>
    </chakra.div>
  </Alert>
)

export const TopAccent = () => (
  <Alert mx="auto" alignItems="flex-start" status="primary">
    <AlertIcon />
    <chakra.div flex="1">
      <AlertTitle display="block" mr="2">
        Holy Smokes
      </AlertTitle>
      <AlertDescription>Something just happened!</AlertDescription>
    </chakra.div>
  </Alert>
)

export const DocsExample = () => {
  return (
    <div>
      <Alert status="success">
        <AlertIcon />
        There was an error processing your request
      </Alert>
    </div>
  )
}
