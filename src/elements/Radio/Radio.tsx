import React from 'react'
import styled, { css } from 'styled-components'
import { themeGet } from '@styled-system/theme-get'
import { BorderProps, borders, space as styledSpace, SpaceProps } from 'styled-system'

import { Flex, FlexProps } from '../Flex/Flex'
import { useRadioGroup } from '../RadioGroup/RadioGroup'
import { Text } from '../Text/Text'

export interface RadioProps extends FlexProps {
  disabled?: boolean
  value: string
  label: React.ReactNode
}

interface ContainerProps extends FlexProps {
  disabled?: boolean
  selected: boolean
}

type InnerCircleProps = Pick<ContainerProps, 'selected'>

export interface RadioToggleProps extends Pick<ContainerProps, 'disabled' | 'selected'>, BorderProps, SpaceProps {}

export const Radio: React.FC<RadioProps> = (props) => {
  const { disabled, value, label, ...rest } = props
  const { onChange, value: radioGroupValue, name } = useRadioGroup()
  const selected = radioGroupValue === value

  return (
    <Container disabled={disabled} selected={selected} my={0.25} {...rest}>
      <Label disabled={disabled}>
        <Flex alignItems="center">
          <RadioButton border={1} mr={0.5} selected={selected} disabled={disabled}>
            <InnerCircle selected={selected} />
          </RadioButton>
          <input
            type="radio"
            hidden
            name={name}
            disabled={disabled}
            onChange={onChange}
            value={value}
            checked={selected}
          />
          <Text>{label}</Text>
        </Flex>
      </Label>
    </Container>
  )
}

const Container = styled(Flex)<ContainerProps>`
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  user-select: none;
`

const Label = styled.label<Pick<ContainerProps, 'disabled'>>`
  display: block;
  color: ${themeGet('colors.neutral800')};
  flex-grow: 1;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
  ${({ disabled }) =>
    disabled &&
    css`
      color: ${themeGet('colors.neutral300')};
    `};
`
const InnerCircle = styled.div<InnerCircleProps>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  transition: background-color 0.25s, opacity 0.25s;
  background-color: ${themeGet('colors.primary500')};
  opacity: ${({ selected }) => (selected ? 1 : 0)};
`

const RadioButton = styled.div<RadioToggleProps>`
  ${borders};
  ${styledSpace};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: border-color 0.25s;
  &:hover {
    border-color: ${themeGet('colors.primary400')};
    ${InnerCircle} {
      background-color: ${themeGet('colors.primary400')};
    }
  }
  &:active {
    border-color: ${themeGet('colors.primary600')};
    ${InnerCircle} {
      background-color: ${themeGet('colors.primary600')};
    }
  }
  ${({ disabled }) =>
    disabled
      ? css`
          border-color: ${themeGet('colors.neutral300')};
          ${InnerCircle} {
            background-color: ${themeGet('colors.neutral300')};
          }
          pointer-events: none;
        `
      : css`
          border-color: ${themeGet('colors.primary500')};
        `}
`
