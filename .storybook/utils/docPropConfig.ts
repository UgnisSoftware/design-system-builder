import { HTMLprops, systemProps } from "../../src/system/src/should-forward-prop"
import { propNames } from "../../src/styled-system"

/* Storybook doc props config
 * to hide default chakra props from
 * the Story */

const storyExcludedProps = ["orientation", "styleConfig", "colorScheme"]

const allProps = [...propNames, ...systemProps, ...propNames, ...storyExcludedProps]

type AllProps = typeof allProps[number]

type Config = {
  table: {
    disable: boolean
  }
}

export const propConfig = allProps.reduce<Record<AllProps, Config>>((acc, prop) => {
  ;(acc as any)[prop] = {
    table: { disable: true },
  }
  return acc
}, {})

export const excludeProps = (...args: any[]) =>
  args?.reduce<Record<AllProps, Config>>((acc, prop) => {
    ;(acc as any)[prop] = {
      table: { disable: true },
    }
    return acc
  }, {})
