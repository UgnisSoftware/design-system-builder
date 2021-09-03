import { render, fireEvent } from "../../../test-utils"
import { useRadio } from "../src"

describe("radio", () => {
  test("handles events and callbacks correctly", () => {
    const hookProps = { onChange: jest.fn() }
    const checkboxProps = {
      onMouseDown: jest.fn(),
      onMouseUp: jest.fn(),
    }
    const inputProps = {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      onFocus: jest.fn(),
      onKeyDown: jest.fn(),
      onKeyUp: jest.fn(),
    }
    const Component = () => {
      const { getCheckboxProps, getInputProps } = useRadio(hookProps)

      return (
        <label>
          <input data-testid="input" {...getInputProps(inputProps)} />
          <div data-testid="checkbox" {...getCheckboxProps(checkboxProps)} />
        </label>
      )
    }
    const utils = render(<Component />)
    const input = utils.getByTestId("input")
    const checkbox = utils.getByTestId("checkbox")

    // mouse up and down
    fireEvent.mouseDown(checkbox)
    expect(checkbox).toHaveAttribute("data-active")
    expect(checkboxProps.onMouseDown).toHaveBeenCalled()

    fireEvent.mouseUp(checkbox)
    expect(checkbox).not.toHaveAttribute("data-active")
    expect(checkboxProps.onMouseUp).toHaveBeenCalled()

    // on change
    fireEvent.click(input)
    expect(input).toBeChecked()
    expect(checkbox).toHaveAttribute("data-checked")
    expect(hookProps.onChange).toHaveBeenCalled()
    expect(inputProps.onChange).toHaveBeenCalled()

    // blur and focus
    fireEvent.focus(input)
    expect(checkbox).toHaveAttribute("data-focus")
    expect(inputProps.onFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(checkbox).not.toHaveAttribute("data-focus")
    expect(inputProps.onFocus).toHaveBeenCalled()

    // key down and key up
    fireEvent.keyDown(input, { key: " ", keyCode: 32 })
    expect(checkbox).toHaveAttribute("data-active")
    expect(inputProps.onKeyDown).toHaveBeenCalled()

    fireEvent.keyUp(input, { key: " ", keyCode: 32 })
    expect(checkbox).not.toHaveAttribute("data-active")
    expect(inputProps.onKeyUp).toHaveBeenCalled()
  })
})
