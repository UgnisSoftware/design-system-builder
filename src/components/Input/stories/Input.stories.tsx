import { useForm } from "react-hook-form"
import type { Meta } from "@storybook/react"

import { ChakraProvider } from "~/react"
import { Button } from "~/components"
import { Input, InputProps } from "../src"
import { propConfig } from "~/utils/src/docPropConfig"
import { filterUndefined } from "~/utils"

export default {
  title: "Input",
  parameters: {
    component: Input,
  },
  args: {
    label: "Label",
  },
  argTypes: {
    ...propConfig,
    disabled: {
      table: { disable: false },
      control: {
        type: "boolean",
      },
    },
  },
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
} as Meta

export const Basic = (args: InputProps) => <Input {...filterUndefined(args)} />

export const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const onSubmit = handleSubmit((data) => console.log(data))
  return (
    <form onSubmit={onSubmit}>
      <Input
        {...register("firstName", { required: "Boom, error" })}
        label={"First name"}
        error={errors.firstName?.message}
      />
      <Button type="submit" mt={2}>
        Submit
      </Button>
    </form>
  )
}
