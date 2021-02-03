import React, { ChangeEvent } from 'react'
import styled, { css } from 'styled-components'
import { Transition } from 'react-spring/renderprops'

import { Flex, FlexProps } from '../Flex/Flex'
import { CheckedIcon, PartiallyCheckedIcon, EmptyIcon } from './CheckboxIcons'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { themeGet } from '@styled-system/theme-get'

export interface CheckboxProps extends FlexProps {
  disabled?: boolean
  value: string
  name: string
  label: React.ReactNode
  onChange: (value: boolean) => void
  checked: boolean | 'indeterminate'
}

type CheckboxIconProps = {
  style: object
  className?: string
  disabled?: boolean
} & Pick<CheckboxProps, 'checked'>

const StyledLabel = styled.label<Pick<CheckboxProps, 'disabled'>>`
  ${({ disabled }) =>
    disabled
      ? css`
          cursor: initial;
          pointer-events: none;
        `
      : css`
          cursor: pointer;
        `}
`

const CheckboxIcon = ({ checked, style, className }: CheckboxIconProps) => {
  if (checked === 'indeterminate') {
    return <PartiallyCheckedIcon style={style} className={className} />
  }
  if (checked) {
    return <CheckedIcon style={style} className={className} />
  }
  return <EmptyIcon style={style} className={className} />
}

const StyledIcon = styled(CheckboxIcon)<CheckboxIconProps>`
  transition: color 0.25s;
  color: ${(props) => themeGet(props.disabled ? 'colors.neutral300' : 'colors.primary500')(props)};
  ${StyledLabel}:hover & {
    color: ${themeGet('colors.primary400')};
  }
  ${StyledLabel}:active & {
    color: ${themeGet('colors.primary600')};
  }
  ${StyledLabel}:disabled & {
    color: ${themeGet('colors.neutral300')};
  }
`

export const Checkbox = ({ disabled, checked, name, label, onChange, value, ...rest }: CheckboxProps) => (
  <Flex {...rest}>
    <StyledLabel disabled={disabled}>
      <Flex alignItems="center">
        <Box position="relative" width={18} height={18} mr={1}>
          <Transition
            items={checked}
            from={{ position: 'absolute', opacity: 0 }}
            enter={{ opacity: 1 }}
            leave={{ opacity: 0 }}
          >
            {(checked) => (props) => <StyledIcon checked={checked} style={props} disabled={disabled} />}
          </Transition>
        </Box>
        <input
          type="checkbox"
          name={name}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          value={value}
          hidden
          checked={checked === 'indeterminate' ? false : checked || false}
        />
        <Text textColor={disabled ? 'neutral300' : 'neutral900'}>{label}</Text>
      </Flex>
    </StyledLabel>
  </Flex>
)
