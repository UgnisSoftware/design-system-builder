import { getClosestValue } from "./media-query.utils"
import { useBreakpoint } from "./use-breakpoint"
import { useTheme } from "../../system"
import { isArray, fromEntries, arrayToObjectNotation } from "../../utils"

/**
 * React hook for getting the value for the current breakpoint from the
 * provided responsive values object.
 *
 * @example
 * const width = useBreakpointValue({ base: '150px', md: '250px' })
 */
export function useBreakpointValue<T = any>(values: Record<string, T> | T[]): T | undefined {
  const breakpoint = useBreakpoint()
  const theme = useTheme()

  if (!breakpoint) return undefined

  /**
   * Get the non-number breakpoint keys from the provided breakpoints
   */
  const breakpoints = Object.keys(theme.breakpoints)

  const obj = isArray(values)
    ? fromEntries<Record<string, T>>(
        Object.entries(arrayToObjectNotation(values, breakpoints)).map(([key, value]) => [key, value]),
      )
    : values

  return getClosestValue(obj, breakpoint, breakpoints)
}
