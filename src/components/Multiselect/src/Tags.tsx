import { Tag, TagCloseButton, TagLabel } from "~/components/Tag"
import type React from "react"
import type { MouseEvent } from "react"
import type { UseMultipleSelectionPropGetters } from "downshift"

export type TagsProps<T, K extends keyof T = keyof T> = {
  items: T[]
  getOptionLabel: (option: T | null) => string
  onMouseDown: (e: MouseEvent<any>) => void
  getSelectedItemProps: UseMultipleSelectionPropGetters<T>["getSelectedItemProps"]
  isDisabled?: boolean
  onTagClose: (e: MouseEvent, item: T) => void
}

export const Tags = <T,>({
  items,
  getSelectedItemProps,
  getOptionLabel,
  isDisabled,
  onMouseDown,
  onTagClose,
}: TagsProps<T>) => {
  return (
    <>
      {items?.map((selectedItem, index) => (
        <Tag
          {...getSelectedItemProps({ selectedItem, index })}
          mr={0.25}
          my={0.25}
          key={`${getOptionLabel(selectedItem)}${index}`}
          isDisabled={isDisabled}
        >
          <TagLabel>{getOptionLabel(selectedItem)}</TagLabel>
          <TagCloseButton
            onMouseDown={onMouseDown}
            isDisabled={isDisabled}
            onClick={(e) => onTagClose(e, selectedItem)}
          />
        </Tag>
      ))}
    </>
  )
}
