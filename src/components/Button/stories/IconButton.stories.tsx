import type { Story, Meta } from "@storybook/react"
import { Button, ButtonProps, IconButton } from "../src"
import { ChakraProvider } from "~/react"
import { filterUndefined } from "~/utils"
import { propConfig } from "~/utils/src/docPropConfig"
import { MdBuild, MdCall, MdAdd } from "react-icons/md"
import { Stack } from "~/components"

const icons = { MdBuild: <MdBuild />, MdCall: <MdCall />, none: undefined }

export default {
  title: "IconButton",
  parameters: {
    component: IconButton,
  },
  args: {
    variant: "primary",
    size: "md",
  },
  argTypes: {
    ...propConfig,
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = (args: ButtonProps) => <IconButton {...filterUndefined(args)} icon={<MdCall />} />

export const iconButton = () => (
  <Stack direction="row">
    <IconButton variant="secondary" isRound icon={<MdCall />} />
    <IconButton icon={<MdBuild />} />
    <IconButton variant="secondary">
      <MdAdd />
    </IconButton>
    <IconButton icon={<MdBuild />} variant="text" />
  </Stack>
)
