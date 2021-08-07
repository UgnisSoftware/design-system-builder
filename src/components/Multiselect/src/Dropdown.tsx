import React from "react"
import type { MouseEvent } from "react"
import { List, ListIcon, ListItem } from "~/components/List"
import { Collapse } from "~/transition"
import { TRANSITIONS } from "~/components/Select/src/constants"
import { MdCheckCircle } from "react-icons/md"
import { useMultiStyleConfig } from "~/system"
import { mergeRefs } from "~/react-utils"
import type { UseComboboxPropGetters } from "downshift"

export type DropdownProps<T, K extends keyof T = keyof T> = {
  items: T[]
  isOpen: boolean
  value: T[K][]
  getOptionLabel: (option: T | null) => string
  highlightedIndex: number
  onMouseDown: (e: MouseEvent<any>) => void
  valueKey: K
  getMenuProps: UseComboboxPropGetters<T>["getMenuProps"]
  getItemProps: UseComboboxPropGetters<T>["getItemProps"]
  popperRef: any
  noOptionsPlaceholder?: string
}

const NO_OPTIONS = "No options"

export const Dropdown = <T,>(props: DropdownProps<T>) => {
  const {
    isOpen,
    items,
    value,
    highlightedIndex,
    getOptionLabel,
    onMouseDown,
    valueKey,
    getMenuProps,
    popperRef,
    getItemProps,
    noOptionsPlaceholder,
  } = props
  const styles = useMultiStyleConfig("Multiselect", props)

  const { ref: downshiftMenuRef, ...menuProps } = getMenuProps()
  const dropdownRef = mergeRefs(downshiftMenuRef, popperRef)
  return (
    <List {...menuProps} ref={dropdownRef} __css={{ ...styles.dropdown, visibility: isOpen ? "visible" : "hidden" }}>
      <Collapse in={isOpen} enterTransition={TRANSITIONS} unmountOnExit>
        {items.length ? (
          items.map((item, index) => (
            <ListItem
              bg={highlightedIndex === index ? "primary.50" : undefined}
              key={`${getOptionLabel(item)}${index}`}
              __css={styles.dropdownItem}
              isTruncated
              onMouseDown={onMouseDown}
              {...getItemProps({
                item,
                index,
              })}
            >
              {value.includes(item[valueKey]) && <ListIcon as={MdCheckCircle} color="primary.500" title="Check" />}
              {getOptionLabel(item)}
            </ListItem>
          ))
        ) : (
          <ListItem __css={styles.dropdownItem} isTruncated>
            {noOptionsPlaceholder || NO_OPTIONS}
          </ListItem>
        )}
      </Collapse>
    </List>
  )
}
