import React from 'react'

type CheckboxIconProps = {
  style?: object
  className?: string
}

export const CheckedIcon = ({ style, className }: CheckboxIconProps) => (
  <svg
    width={18}
    height={18}
    style={style}
    className={className}
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 0H2.5C1.39 0 0.5 0.9 0.5 2V16C0.5 17.1 1.39 18 2.5 18H16.5C17.61 18 18.5 17.1 18.5 16V2C18.5 0.9 17.61 0 16.5 0ZM7.5 14L2.5 9L3.91 7.59L7.5 11.17L15.09 3.58L16.5 5L7.5 14Z"
      fill="currentColor"
    />
  </svg>
)

export const PartiallyCheckedIcon = ({ style, className }: CheckboxIconProps) => (
  <svg
    width={18}
    height={18}
    className={className}
    viewBox="0 0 19 18"
    style={{ ...style }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 0H2.5C1.4 0 0.5 0.9 0.5 2V16C0.5 17.1 1.4 18 2.5 18H16.5C17.6 18 18.5 17.1 18.5 16V2C18.5 0.9 17.6 0 16.5 0ZM14.5 10H4.5V8H14.5V10Z"
      fill="currentColor"
    />
  </svg>
)

export const EmptyIcon = ({ style, className }: CheckboxIconProps) => (
  <svg
    width={18}
    height={18}
    style={style}
    className={className}
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 2V16H2.5V2H16.5ZM16.5 0H2.5C1.4 0 0.5 0.9 0.5 2V16C0.5 17.1 1.4 18 2.5 18H16.5C17.6 18 18.5 17.1 18.5 16V2C18.5 0.9 17.6 0 16.5 0Z"
      fill="currentColor"
    />
  </svg>
)
