const parts = ["container", "track", "thumb"]

const baseStyleTrack = {
  borderRadius: "full",
  p: "4px",
  width: "var(--slider-track-width)",
  height: "var(--slider-track-height)",
  transition: "all 120ms",
  bg: "neutral.300",
  _disabled: {
    bg: "neutral.100",
    _checked: {
      bg: "primary.200",
    },
    cursor: "not-allowed",
  },
  _checked: {
    bg: "primary.600",
  },
}

const baseStyleThumb = {
  bg: "white",
  transition: "transform 250ms",
  borderRadius: "inherit",
  width: "var(--slider-track-height)",
  height: "var(--slider-track-height)",
  _checked: {
    transform: "translateX(var(--slider-thumb-x))",
  },
}

const baseStyle = {
  container: {
    "--slider-track-diff": "calc(var(--slider-track-width) - var(--slider-track-height))",
    "--slider-thumb-x": "var(--slider-track-diff)",
    _rtl: {
      "--slider-thumb-x": "calc(-1 * var(--slider-track-diff))",
    },
  },
  track: baseStyleTrack,
  thumb: baseStyleThumb,
}

const sizes = {
  lg: {
    container: {
      "--slider-track-width": "2.25rem",
      "--slider-track-height": "0.875rem",
    },
  },
}

const defaultProps = {
  size: "lg",
}

export default {
  parts,
  baseStyle,
  sizes,
  defaultProps,
}
