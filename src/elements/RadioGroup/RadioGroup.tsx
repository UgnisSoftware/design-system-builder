import React, { ChangeEvent, FC } from 'react'

import { Flex } from '../Flex/Flex'

export type RadioGroupProps = {
  value: string
  onChange: (value: ChangeEvent<HTMLInputElement>) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupProps>({} as any)
export const useRadioGroup = () => React.useContext<RadioGroupProps>(RadioGroupContext)

export const RadioGroup: FC<RadioGroupProps> = ({ children, ...rest }) => (
  <RadioGroupContext.Provider value={{ ...rest }}>
    <Flex flexDirection="column" role="radiogroup">
      {children}
    </Flex>
  </RadioGroupContext.Provider>
)
