import React, { useState, useRef, ForwardedRef, MouseEvent, useCallback } from "react"
import { useCombobox, useMultipleSelection } from "downshift"
import { MdExpandMore, MdClose } from "react-icons/md"

import type { FormControlOptions } from "~/form-control"
import { chakra, omitThemingProps, SystemStyleObject, ThemingProps, useMultiStyleConfig } from "~/system"
import { __DEV__ } from "~/utils"
import { InputCore, InputError } from "~/components/Input"
import { Label } from "~/components/Input"
import { useFormControl } from "~/form-control"
import { Icon } from "~/icon"
import { usePopper, UsePopperProps } from "~/popper"
import { mergeRefs } from "~/react-utils"
import { Dropdown } from "./Dropdown"
import { Tags } from "./Tags"

export type MultiselectProps<T, K extends keyof T = keyof T> = ThemingProps<"Multiselect"> &
  Omit<FormControlOptions, "isInvalid" | "isReadOnly"> & {
    placeholder?: string
    options: T[]
    value?: T[K][]
    label?: string
    error?: string
    onChange?: (value: string[]) => void
    getOptionLabel?: (option: T | null) => string
    valueKey?: K
    noOptionsPlaceholder?: string
    placement?: UsePopperProps["placement"]
    autoFocused?: boolean
  }

const itemToString = <T extends { label?: string; id?: string }>(item: T | null) => item?.label ?? ""

export const Multiselect = React.forwardRef(
  <T extends { label?: string; id?: string }>(props: MultiselectProps<T>, ref: ForwardedRef<any>) => {
    const {
      value = [],
      options: items,
      onChange,
      label,
      isRequired,
      error,
      valueKey = "id",
      placement = "bottom-start",
      getOptionLabel = itemToString,
      noOptionsPlaceholder,
      isDisabled,
    } = omitThemingProps(props)

    const styles = useMultiStyleConfig("Multiselect", props)
    const ownProps = useFormControl<HTMLSelectElement>(props)
    const [inputItems, setInputItems] = useState(items)

    const selectedItems = items.filter((item) => value.includes(item[valueKey]))
    const { getSelectedItemProps, addSelectedItem, removeSelectedItem, reset, getDropdownProps } = useMultipleSelection(
      {
        onSelectedItemsChange: ({ selectedItems }) => {
          if (selectedItems) {
            onChange?.(selectedItems.map((item) => (item as any)[valueKey]))
          }
        },
        selectedItems,
        stateReducer: (_, actionAndChanges) => {
          const { type, changes } = actionAndChanges
          switch (type) {
            case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
              return {
                ...changes,
                activeIndex: undefined,
              }
            default:
              return changes
          }
        },
      },
    )

    const {
      isOpen,
      getLabelProps,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps,
      openMenu,
    } = useCombobox({
      selectedItem: null,
      items: inputItems,
      onInputValueChange: ({ inputValue }) => {
        const filteredItems = items.filter((item) =>
          getOptionLabel(item)
            .toLowerCase()
            .startsWith(inputValue?.toLowerCase() || ""),
        )

        setInputItems(filteredItems)
      },
      stateReducer: (state, actionAndChanges) => {
        const { changes, type } = actionAndChanges
        switch (type) {
          case useCombobox.stateChangeTypes.InputBlur:
            return {
              ...changes,
              highlightedIndex: state.highlightedIndex,
              inputValue: "",
            }
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            return {
              ...changes,
              highlightedIndex: state.highlightedIndex,
              isOpen: true,
              inputValue: "",
            }
          case useCombobox.stateChangeTypes.FunctionOpenMenu:
            return {
              ...changes,
              isOpen: !isDisabled,
            }
          default:
            return changes
        }
      },
      onStateChange: ({ type, selectedItem }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            if (selectedItem) {
              if (value?.includes(selectedItem[valueKey])) {
                removeSelectedItem(selectedItem)
              } else {
                addSelectedItem(selectedItem)
              }
            }
            break
          default:
            break
        }
      },
    })

    const { ref: comboboxPropsRef, ...comboboxProps } = getComboboxProps()
    const { ref: downshiftInputRef, ...inputProps } = getInputProps(
      getDropdownProps({
        onClick: isOpen ? () => {} : openMenu,
      }),
    )
    const { popperRef, referenceRef } = usePopper({
      placement,
      matchWidth: true,
    })
    const inputFocusRef = useRef<HTMLInputElement>(null)
    const inputWrapperRef = mergeRefs(comboboxPropsRef, referenceRef)
    const inputRef = mergeRefs(downshiftInputRef, inputFocusRef)

    const focusInput = useCallback(() => inputFocusRef.current?.focus(), [inputFocusRef])
    const handleMouseDown = useCallback((e: MouseEvent) => e.preventDefault(), [])
    const handleInputWrapperClick = useCallback(() => {
      if (isDisabled) {
        return
      }
      focusInput()
      if (!isOpen) {
        openMenu()
      }
    }, [isOpen, openMenu, focusInput, isDisabled])
    const handleTagClose = useCallback(
      (e: MouseEvent, item: T) => {
        e.stopPropagation()
        removeSelectedItem(item)
      },
      [items, removeSelectedItem],
    )
    const handleClearMultiselect = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        if (isDisabled) {
          return
        }
        reset()
        focusInput()
      },
      [reset, focusInput, isDisabled],
    )

    const rootStyles: SystemStyleObject = {
      width: "100%",
      height: "fit-content",
      position: "relative",
    }

    return (
      <chakra.div __css={rootStyles}>
        <Label text={label || ""} isRequired={isRequired} {...getLabelProps()} />
        <chakra.div
          __css={styles.field}
          {...comboboxProps}
          ref={inputWrapperRef}
          aria-invalid={!!error}
          onClick={handleInputWrapperClick}
          disabled={isDisabled}
        >
          <Tags
            items={selectedItems}
            getSelectedItemProps={getSelectedItemProps}
            getOptionLabel={getOptionLabel}
            isDisabled={isDisabled}
            onMouseDown={handleMouseDown}
            onTagClose={handleTagClose}
          />
          <InputCore {...ownProps} variant="unstyled" __css={styles.input} {...inputProps} ref={inputRef} />
          <chakra.div __css={styles.iconBox}>
            <Icon
              as={MdClose}
              __css={styles.clearIcon}
              onMouseDown={handleMouseDown}
              onClick={handleClearMultiselect}
              isDisabled={isDisabled}
            />
            <Icon as={MdExpandMore} __css={styles.selectIcon} isDisabled={isDisabled} />
          </chakra.div>
        </chakra.div>
        <InputError error={error} />
        <Dropdown
          items={inputItems}
          isOpen={isOpen}
          highlightedIndex={highlightedIndex}
          getOptionLabel={getOptionLabel}
          onMouseDown={handleMouseDown}
          getMenuProps={getMenuProps}
          valueKey={valueKey}
          popperRef={popperRef}
          getItemProps={getItemProps}
          noOptionsPlaceholder={noOptionsPlaceholder}
          value={value}
        />
      </chakra.div>
    )
  },
)

if (__DEV__) {
  Multiselect.displayName = "Multiselect"
}
