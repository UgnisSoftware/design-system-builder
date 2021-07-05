import { render, screen, testA11y } from "~/test-utils"
import { InputCore, InputGroup, InputLeftElement, InputRightElement } from "../src"

test("passes a11y test", async () => {
  await testA11y(<InputCore />, {
    axeOptions: {
      rules: {
        label: { enabled: false },
      },
    },
  })
})

test("Elements inside input render correctly", () => {
  const { getByText } = render(
    <InputGroup>
      <InputLeftElement>
        <span>Hello</span>
      </InputLeftElement>
      <InputCore />
      <InputRightElement>
        <span>World</span>
      </InputRightElement>
    </InputGroup>,
  )
  expect(getByText("Hello")).toBeInTheDocument()
  expect(getByText("World")).toBeInTheDocument()
})

test("Invalid input renders correctly", () => {
  render(<InputCore isInvalid />)

  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
})

test("Disabled input renders correctly", () => {
  render(<InputCore isDisabled />)

  expect(screen.getByRole("textbox")).toHaveAttribute("disabled")
})

test("Readonly input renders correctly", () => {
  render(<InputCore isReadOnly />)

  expect(screen.getByRole("textbox")).toHaveAttribute("aria-readonly", "true")
})
