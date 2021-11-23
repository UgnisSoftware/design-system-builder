type Dict = Record<string, any>

const parts = ["container", "title", "description", "icon"]

const baseStyle = {
  container: {
    py: "0.75rem",
    px: "1rem",
    borderRadius: "md",
  },
  title: {
    fontWeight: "bold",
    mr: "0.5rem",
  },
  description: {},
  icon: {
    position: "relative",
    flexShrink: 0,
    mr: "0.75rem",
    w: "1.25rem",
    h: "1.25rem",
  },
}

function variantSubtle(props: Dict) {
  const { status } = props
  return {
    container: {
      bg: `${status}.50`,
    },
    icon: {
      color: `${status}.500`,
    },
  }
}

const variants = {
  subtle: variantSubtle,
}

const defaultProps = {
  variant: "subtle",
}

export default {
  parts,
  baseStyle,
  variants,
  defaultProps,
}
