import React from "react"
import styled from "@emotion/styled"

import type { RequireField } from "../../utils/types"
import type { Color } from "../../theme/theme"

export type SpinnerVariant = "xsmall" | "small" | "medium"
export type SpinnerProps = {
  variant?: SpinnerVariant
  className?: string
  color?: Color
}

export const SpinnerSizes = {
  xsmall: 12,
  small: 14,
  medium: 62,
} as const

export const Spinner = ({ variant, className, color }: SpinnerProps) => (
  <StyledSpinner viewBox="0 0 66 66" variant={variant || "medium"} className={className} color={color}>
    <circle className="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
  </StyledSpinner>
)

const StyledSpinner = styled.svg<RequireField<SpinnerProps, "variant">>`
  animation: rotate 1s linear infinite;
  width: ${({ variant }) => SpinnerSizes[variant]}px;
  height: ${({ variant }) => SpinnerSizes[variant]}px;

  & .path {
    stroke: ${(props) => (props.color ? props.theme.colors[props.color] : props.theme.colors.neutral800)};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 180;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 180;
      stroke-dashoffset: -15;
    }
    100% {
      stroke-dasharray: 90, 180;
      stroke-dashoffset: -180;
    }
  }
`
