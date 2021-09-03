import React, { useState } from "react"
import { Multiselect as Component } from "../"
import { fireEvent, render, within } from "@testing-library/react"

const LABEL = "label"
const NAME1 = "NAME1"
const NAME2 = "NAME2"
const ID1 = "1"
const ID2 = "2"
const CLEAR_ICON = "Clear"
const CLOSE_TAG_ICON = "Close"
const CHECK_ICON = "Check"
const OPTIONS = [
  { id: ID1, label: NAME1 },
  { id: ID2, label: NAME2 },
]
const ERROR = "Error text"

const Multiselect = (props: any) => {
  const [value, setValue] = useState([])
  return (
    <Component label={LABEL} options={OPTIONS} value={value} onChange={(value: any) => setValue(value)} {...props} />
  )
}

describe("Multiselect tests", () => {
  it("Should open dropdown on label click", () => {
    const { queryByText, getByText } = render(<Multiselect />)
    expect(queryByText(NAME1)).not.toBeInTheDocument()
    fireEvent.click(getByText(LABEL))
    expect(queryByText(NAME1)).toBeInTheDocument()
  })

  it("Should focus input on 'Clear-icon' click", () => {
    const focusFn = jest.fn()
    const { getByTitle } = render(<Multiselect onFocus={focusFn} />)
    fireEvent.click(getByTitle(CLEAR_ICON))
    expect(focusFn).toHaveBeenCalled()
  })

  it("Should call onChange on item click", () => {
    const onChangeFn = jest.fn()
    const { getByText } = render(<Multiselect onChange={onChangeFn} />)
    fireEvent.click(getByText(LABEL))
    fireEvent.click(getByText(NAME1))
    expect(onChangeFn).toHaveBeenCalledWith([ID1])
  })

  it("Should change value on Tag close-button click", () => {
    const onChangeFn = jest.fn()
    const { getByText } = render(<Multiselect value={[ID1, ID2]} onChange={onChangeFn} />)
    fireEvent.click(within(getByText(NAME1).parentElement!).getByTitle(CLOSE_TAG_ICON))
    expect(onChangeFn).toHaveBeenCalledWith([ID2])
  })

  it("Should render error state", () => {
    const { getByText } = render(<Multiselect error={ERROR} />)
    expect(getByText(ERROR)).toBeInTheDocument()
  })

  it("Should not allow interactions with 'disabled' state", () => {
    const { getByText, queryByText } = render(<Multiselect disabled />)
    fireEvent.click(getByText(LABEL))
    expect(queryByText(NAME1)).not.toBeInTheDocument()
  })

  it("Should render check-icon next to list item when prior is selected", () => {
    const { getByText, getByTitle } = render(<Multiselect />)
    fireEvent.click(getByText(LABEL))
    fireEvent.click(getByText(NAME1))
    expect(getByTitle(CHECK_ICON)).toBeInTheDocument()
  })
})
