import React, { useState } from "react"
import { VerticalNavigation as Component } from "~/components/VerticalNavigation"
import { fireEvent, render } from "@testing-library/react"
import MatchMediaMock from "jest-matchmedia-mock"
import { ThemeProvider } from "~/system"
import { queries, theme } from "~/media-query/tests/test-data"

const NAME1 = "NAME1"
const NAME2 = "NAME2"
const ID1 = "1"
const ID2 = "2"
const OPEN_BUTTON = "Open"
const CLOSE_BUTTON = "Close"
const OPTIONS = [
  { id: ID1, label: NAME1 },
  { id: ID2, label: NAME2 },
]

type VerticalNavigationProps = {
  open?: boolean
  onClose?: () => void
}

const VerticalNavigation = ({ open = true, onClose }: VerticalNavigationProps) => {
  const [isOpen, setIsOpen] = useState(open)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>{OPEN_BUTTON}</button>
      <Component
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          onClose?.()
        }}
      >
        <Component.List>
          {OPTIONS.map(({ id, label }) => (
            <Component.ListItem key={id}>{label}</Component.ListItem>
          ))}
          <button onClick={() => setIsOpen(false)}>{CLOSE_BUTTON}</button>
        </Component.List>
      </Component>
    </>
  )
}

let matchMedia: any

beforeAll(() => {
  matchMedia = new MatchMediaMock()
})

afterEach(() => {
  matchMedia.clear()
})

function renderWithTheme(component: React.ReactNode, query: string = queries.base) {
  matchMedia.useMediaQuery(query)
  return render(<ThemeProvider theme={theme as any}>{component}</ThemeProvider>)
}

describe("VerticalNavigation", () => {
  it("Should open on button click", () => {
    const { getByText, queryByText } = renderWithTheme(<VerticalNavigation open={false} />)
    expect(queryByText(NAME1)).not.toBeInTheDocument()
    fireEvent.click(getByText(OPEN_BUTTON))
    expect(queryByText(NAME1)).toBeInTheDocument()
  })
})
