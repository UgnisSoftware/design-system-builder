import * as React from "react"
import { chakra, forwardRef, HTMLChakraProps } from "~/system"
import type { Merge } from "~/utils"
import { useClickable, UseClickableProps } from "../src"

export type ClickableProps = Merge<UseClickableProps, HTMLChakraProps<"button">>

const Clickable: React.FC<ClickableProps> = forwardRef((props, ref) => {
  const clickable = useClickable({ ...props, ref } as any) as HTMLChakraProps<"button">
  return <chakra.button display="inline-flex" {...clickable} />
})

export default {
  title: "Utils/Clickable",
}

export const button = () => (
  <>
    <Clickable
      as="div"
      onClick={() => {
        alert("clicked")
      }}
      style={{
        userSelect: "none",
      }}
      _active={{ bg: "blue.500", color: "white" }}
      _disabled={{ opacity: 0.4, pointerEvents: "none" }}
    >
      Clickable
    </Clickable>

    <Clickable isDisabled isFocusable _disabled={{ opacity: 0.4, pointerEvents: "none" }}>
      Clickable
    </Clickable>

    <button
      onClick={() => {
        alert("clicked")
      }}
    >
      Native Button
    </button>
  </>
)
