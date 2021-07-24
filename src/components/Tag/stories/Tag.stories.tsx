import * as React from "react"
import { Tag, TagLeftIcon, TagLabel, TagRightIcon, TagCloseButton } from "../src"
import { chakra } from "~/system"
import { MdSettings } from "react-icons/md"
import { ChakraProvider } from "~/react"
import type { Meta } from "@storybook/react"

export default {
  title: "Tag",
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = () => <Tag>Gray</Tag>

/**
 * The tag component can contain an Icon. This is done by using the `TagIcon` component.
 * Positioning the tag icon can be done by placing it before (left side)
 * or after (right side) the tag component
 */

export const withLeftIcon = () => (
  <Tag>
    <TagLeftIcon w="12px" h="12px" as={MdSettings} />
    <TagLabel>Green</TagLabel>
  </Tag>
)

export const withRightIcon = () => (
  <>
    <Tag>
      <TagLabel>Green</TagLabel>
      <TagRightIcon w="12px" h="12px" as={MdSettings} />
    </Tag>

    <Tag variant="solid">
      <TagLabel>Teal</TagLabel>
      <TagRightIcon as={MdSettings} />
    </Tag>
  </>
)

/**
 * Use the `TagCloseButton` to apply a close button to the tag component.
 */

export const withCloseButton = () => (
  <Tag variant="solid">
    <TagLabel>Tab Label</TagLabel>
    <TagCloseButton />
  </Tag>
)
