import * as React from "react"
import { Spinner } from "../src"

export default {
  title: "Spinner",
}

/**
 * A simple spinner.
 */

export const basic = () => <Spinner />

/**
 * Pass the `color` prop to change the background color of
 * the moving section of the spinner.
 */

export const color = () => <Spinner color="red.500" />

/**
 * Pass the `size` prop to change the size of the spinner.
 */

