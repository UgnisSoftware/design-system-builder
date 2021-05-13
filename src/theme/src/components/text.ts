const variants = {
  h1: {
    fontSize: "7xl",
  },
  h2: {
    fontSize: "6xl",
  },
  h3: {
    fontSize: "5xl",
  },
  h4: {
    fontSize: "4xl",
  },
  h5: {
    fontSize: "2xl",
  },
  h6: {
    fontSize: "lg",
  },
  body: {
    fontSize: "md",
  },
  body2: {
    fontSize: "sm",
  },
  caption: {
    fontSize: "xs",
  },
}

const sizes = {
  paragraph: {
    lineHeight: "shorter",
  },
  header: {
    lineHeight: "base",
  },
  trimmed: {
    lineHeight: "none",
  },
}

const defaultProps = {
  variant: "body",
  size: "paragraph",
}

export default {
  variants,
  sizes,
  defaultProps,
}
