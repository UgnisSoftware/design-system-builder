import * as React from "react"
import type { Meta } from "@storybook/react"

import { Box, Button, ButtonProps, VStack } from "~/components"
import { Select } from "../src"
import { ChakraProvider } from "~/react"
import { useForm, Controller } from "react-hook-form"
import { Input } from "~/components/Input"
import { propConfig } from "~/utils/src/docPropConfig"
import { filterUndefined } from "~/utils"

export default {
  title: "Select",
  parameters: {
    component: Select,
  },
  args: {
    label: "Label",
  },
  argTypes: {
    ...propConfig,
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Box pb={10}>
          <Story />
        </Box>
      </ChakraProvider>
    ),
  ],
} as Meta

const options = [
  { label: "apple", id: "1" },
  { label: "martini", id: "2" },
  { label: "olive", id: "3" },
  { label: "spritz", id: "4" },
  { label: "orange", id: "5" },
  { label: "prosecco", id: "6" },
]

export const Basic = (args: ButtonProps) => <Select {...filterUndefined(args)} options={options} />

export const Form = () => {
  const { handleSubmit, control } = useForm()
  const onSubmit = handleSubmit((data) => console.log(data))
  return (
    <form onSubmit={onSubmit}>
      <VStack spacing={4}>
        <Controller
          name="pet"
          control={control}
          defaultValue={""}
          render={({ field, fieldState: { error } }) => <Input {...field} error={error?.message} label={"Pet"} />}
        />
        <Controller
          rules={{ required: "boom, error" }}
          name="drink"
          defaultValue={"3"}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select {...field} options={options} error={error?.message} label={"label"} />
          )}
        />
      </VStack>
      <Button type="submit" mt={2}>
        Submit
      </Button>
    </form>
  )
}
