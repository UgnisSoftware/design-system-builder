import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LightMode } from "../src"
import { DummyComponent, getColorModeButton } from "./utils"

describe("<LightMode />", () => {
  test("is always light", () => {
    render(
      <LightMode>
        <DummyComponent />
      </LightMode>,
    )

    const button = getColorModeButton()

    expect(button).toHaveTextContent("light")

    userEvent.click(button)

    expect(getColorModeButton()).toHaveTextContent("light")
  })
})
