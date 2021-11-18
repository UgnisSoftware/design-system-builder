import React, { useState, MouseEvent, useRef, useCallback, useMemo, ForwardedRef } from "react"
import { useCombobox } from "downshift"
import { MdExpandMore, MdClose } from "react-icons/md"
import { chakra, omitThemingProps, SystemStyleObject, ThemingProps, useMultiStyleConfig } from "~/system"
import { __DEV__, noop } from "~/utils"
import { InputCore, InputError } from "~/components/Input"
import { Label } from "~/components/Input"
import { useFormControl, UseFormControlProps } from "~/form-control"
import { List, ListItem } from "~/components/List"
import { Icon } from "~/icon"
import { Collapse } from "~/transition"
import { usePopper, UsePopperProps } from "~/popper"
import { mergeRefs } from "~/react-utils"
import { TRANSITIONS } from "./constants"

const NO_OPTIONS = "No options"

export type SelectProps<T, K extends keyof T = keyof T> = ThemingProps<"Select"> &
  UseFormControlProps<HTMLInputElement> & {
    placeholder?: string
    options: T[]
    selectedItem?: T
    label?: string
    error?: string
    onChange?: (value: string) => void
    getOptionLabel?: (option: T | null) => string
    valueKey?: K
    value?: T[K]
    noOptionsPlaceholder?: string
    placement?: UsePopperProps["placement"]
  }

const itemToString = <T extends { label?: string; id?: string }>(item: T | null) => item?.label ?? ""

export const Select = React.forwardRef(
  <T extends { label?: string; id?: string }>(props: SelectProps<T>, ref: ForwardedRef<any>) => {
    const styles = useMultiStyleConfig("Select", props)
    const {
      value,
      options: items,
      onChange,
      label,
      valueKey = "id",
      placement = "bottom-start",
      getOptionLabel = itemToString,
      noOptionsPlaceholder = NO_OPTIONS,
      ...rest
    } = omitThemingProps(props)
    const ownProps = useFormControl<HTMLInputElement>(rest)
    const [inputItems, setInputItems] = useState(items)
    const { popperRef, referenceRef } = usePopper({
      placement,
      matchWidth: true,
    })
    const inputFocusRef = useRef<HTMLInputElement>(null)
    const initialSelectedItem = useMemo(() => items?.find((item) => item[valueKey!] === value), [items, valueKey])

    const {
      isOpen,
      getLabelProps,
      getMenuProps,
      getComboboxProps,
      highlightedIndex,
      openMenu,
      getItemProps,
      getInputProps,
      selectItem,
      inputValue,
    } = useCombobox({
      items: inputItems,
      itemToString: getOptionLabel,
      initialSelectedItem,
      initialInputValue: getOptionLabel(initialSelectedItem!),
      onSelectedItemChange: ({ selectedItem }) => onChange?.((selectedItem as any)?.[valueKey]),
      stateReducer: (_, { type, changes }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputBlur:
            return {
              ...changes,
              ...{
                inputValue: getOptionLabel(changes?.selectedItem!) ?? "",
              },
            }
          default:
            return changes
        }
      },
      onStateChange: ({ type, inputValue, selectedItem }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputChange:
            if (inputValue === "") {
              resetSelectValue()
            }
            setInputItems(
              items.filter((item) =>
                getOptionLabel(item)
                  .toLowerCase()
                  .startsWith(inputValue?.toLowerCase() || ""),
              ),
            )
            return
          case useCombobox.stateChangeTypes.InputBlur:
            setInputItems(items)
            return
          default:
            return
        }
      },
    })

    const { ref: downshiftMenuRef, ...menuProps } = getMenuProps()
    const { ref: comboboxPropsRef, ...comboboxProps } = getComboboxProps()
    const { ref: downshiftInputRef, ...inputProps } = getInputProps({
      onClick: isOpen ? () => {} : openMenu,
    })
    const dropdownRef = mergeRefs(downshiftMenuRef, popperRef)
    const inputRef = mergeRefs(inputFocusRef, downshiftInputRef)
    const inputWrapperRef = mergeRefs(comboboxPropsRef, referenceRef)

    const resetSelectValue = useCallback(
      () =>
        // @ts-ignore
        selectItem(null),
      [],
    )

    const onResetValueClick = useCallback(
      (e: MouseEvent) => {
        if (ownProps.disabled) return
        e.preventDefault()
        resetSelectValue()
        inputFocusRef?.current?.focus()
      },
      [ownProps.disabled],
    )

    const rootStyles: SystemStyleObject = {
      width: "100%",
      height: "fit-content",
      position: "relative",
    }

    return (
      <chakra.div __css={rootStyles}>
        <Label text={label || ""} isRequired={ownProps.required} {...getLabelProps()} />
        <chakra.div __css={rootStyles} {...comboboxProps} ref={inputWrapperRef}>
          <InputCore {...ownProps} __css={styles.field} ref={inputRef} {...inputProps} />
          <chakra.div __css={styles.iconBox}>
            {inputValue && (
              <Icon as={MdClose} __css={styles.clearIcon} onClick={onResetValueClick} isDisabled={ownProps.disabled} />
            )}
            <Icon
              as={MdExpandMore}
              __css={styles.selectIcon}
              isDisabled={ownProps.disabled}
              onClick={ownProps.disabled ? noop : openMenu}
            />
          </chakra.div>
        </chakra.div>
        <InputError error={ownProps.error} />
        <List
          {...menuProps}
          ref={dropdownRef}
          __css={{ ...styles.dropdown, visibility: isOpen ? "visible" : "hidden" }}
        >
          <Collapse in={isOpen} enterTransition={TRANSITIONS}>
            {inputItems.length ? (
              inputItems.map((item, index) => (
                <ListItem
                  bg={highlightedIndex === index ? "primary.50" : undefined}
                  key={`${getOptionLabel(item)}${index}`}
                  {...getItemProps({ item, index })}
                  __css={styles.dropdownItem}
                  isTruncated
                >
                  {getOptionLabel(item)}
                </ListItem>
              ))
            ) : (
              <ListItem __css={styles.dropdownItem} isTruncated>
                {noOptionsPlaceholder}
              </ListItem>
            )}
          </Collapse>
        </List>
      </chakra.div>
    )
  },
)

if (__DEV__) {
  Select.displayName = "Select"
}
