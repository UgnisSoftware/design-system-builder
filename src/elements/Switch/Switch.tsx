import React from "react"
import styled from "@emotion/styled"
import { themeGet } from "@styled-system/theme-get"

import { Box } from "../Box/Box"

type SwitchProps = {
  name: string
  value: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  textLeft?: React.ReactNode
  textRight?: React.ReactNode
}

type StyledBaseProps = Pick<SwitchProps, "checked" | "disabled">
type StyledThumbProps = StyledBaseProps
type StyledLabelProps = Pick<SwitchProps, "disabled">

const getStyledBaseBg = (props: StyledBaseProps) => {
  const { checked, disabled } = props
  if (checked && disabled) {
    return themeGet("colors.primary200")(props)
  }
  if (checked && !disabled) {
    return themeGet("colors.primary600")(props)
  }
  if (!checked && disabled) {
    return themeGet("colors.neutral100")(props)
  }
  return themeGet("colors.neutral300")(props)
}

const StyledBase = styled(Box)<StyledBaseProps>`
  position: relative;
  background-color: ${(props) => getStyledBaseBg(props)};
  border: 4px solid ${(props) => getStyledBaseBg(props)};
  height: ${themeGet("sizes.switch.height")};
  width: ${themeGet("sizes.switch.width")};
  border-radius: ${themeGet("radii.pill")};
  transition: background-color 100ms, border 100ms;
`

const StyledThumb = styled(Box)<StyledThumbProps>`
  position: absolute;
  background-color: ${themeGet("colors.white")};
  border-radius: ${themeGet("radii.round")};
  transition: transform 100ms cubic-bezier(0.22, 1, 0.36, 1);
  height: 14px;
  width: 14px;
  transform: ${({ checked }) => (checked ? "translateX(21px)" : "translateX(1px)")};
`

const StyledLabel = styled.label<StyledLabelProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  ${({ disabled }) =>
    disabled
      ? `
          cursor: initial;
          pointer-events: none;
        `
      : `
          cursor: pointer;
        `}
`

export const Switch = ({ name, checked, disabled, value, onChange, textLeft, textRight }: SwitchProps) => (
  <StyledLabel disabled={disabled}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      disabled={disabled}
      value={value}
      hidden
      onChange={(event) => onChange(event.target.checked)}
    />
    {textLeft}
    <StyledBase checked={checked} disabled={disabled}>
      <StyledThumb checked={checked} />
    </StyledBase>
    {textRight}
  </StyledLabel>
)
