import { EASINGS } from "~/transition"

export const TRANSITIONS = {
  height: {
    duration: 0.2,
    ease: EASINGS.ease,
  },
  opacity: {
    duration: 0.1,
    ease: EASINGS.ease,
  },
} as const
