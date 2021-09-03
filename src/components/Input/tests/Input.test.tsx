import { render, screen, testA11y } from "~/test-utils"
import { InputCore, InputGroup, InputLeftElement, InputRightElement } from "../src"

describe("input", () => {
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

  test("Disabled input renders correctly", () => {
    render(<InputCore disabled />)

    expect(screen.getByRole("textbox")).toHaveAttribute("disabled")
  })
})
