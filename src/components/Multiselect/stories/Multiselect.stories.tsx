import * as React from "react"
import type { Meta } from "@storybook/react"

import { Box, Button, ButtonProps, VStack } from "~/components"
import { Multiselect, MultiselectProps } from "../src"
import { ChakraProvider } from "~/react"
import { useForm, Controller } from "react-hook-form"
import { propConfig } from "~/utils/src/docPropConfig"
import { filterUndefined } from "~/utils"
import { Select } from "~/components/Select"

const options = [
  { label: "apple", id: "1" },
  { label: "martini", id: "2" },
  { label: "olive", id: "3" },
  { label: "spritz", id: "4" },
  { label: "orange", id: "5" },
  { label: "prosecco", id: "6" },
]

export default {
  title: "Multiselect",
  parameters: {
    component: Multiselect,
  },
  args: {
    label: "Label",
    options,
    value: ["1", "2"],
    placeholder: "Select multiple",
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

export const Basic = (args: MultiselectProps<any>) => <Multiselect {...(filterUndefined(args) as any)} />

export const Form = () => {
  const { handleSubmit, control } = useForm()
  const onSubmit = handleSubmit((data) => console.log(data))
  return (
    <form onSubmit={onSubmit}>
      <VStack spacing={4}>
        <Controller
          name="pet"
          rules={{ required: "boom, error" }}
          control={control}
          defaultValue={["1", "2"]}
          render={({ field, fieldState: { error } }) => (
            <Multiselect {...field} options={options} error={(error as any)?.message} label={"label"} />
          )}
        />
        <Controller
          rules={{ required: "boom, error" }}
          name="drink"
          defaultValue={"3"}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select {...field} options={options} error={(error as any)?.message} label={"label"} />
          )}
        />
      </VStack>
      <Button type="submit" mt={2}>
        Submit
      </Button>
    </form>
  )
}
