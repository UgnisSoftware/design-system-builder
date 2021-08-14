import { mode } from "~/theme-tools"

const parts = ["table", "thead", "tbody", "tr", "th", "td", "caption"]

type Dict = Record<string, any>

export const GRID_COLUMN_WIDTHS = "--template-columns"
export const GRID_ROW_HEIGHT = "--template-row-height"
export const GRID_ROW_WIDTH = "--template-row-width"

const baseStyle = {
  tbody: {},
  thead: {
    backgroundColor: "white",
    display: "grid",
    contain: "size layout style paint",
    gridAutoFlow: `column`,
    gridAutoColumns: `var(${GRID_COLUMN_WIDTHS})`,
    gridAutoRows: `var(${GRID_ROW_HEIGHT})`,
    height: `var(${GRID_ROW_HEIGHT})`,
    lineHeight: `var(${GRID_ROW_HEIGHT})`,
    width: `var(${GRID_ROW_WIDTH})`,
  },
  trStickyContainer: {
    position: "sticky",
    top: 0,
    left: 0,
    backgroundColor: "white",
    willChange: "transform",
    marginLeft: -16,
  },
  th: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "wider",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "start",
  },
  tr: {
    display: "grid",
    contain: "size layout style paint",
    gridAutoFlow: `column`,
    gridAutoColumns: `var(${GRID_COLUMN_WIDTHS})`,
    gridAutoRows: `var(${GRID_ROW_HEIGHT})`,
    height: `var(${GRID_ROW_HEIGHT})`,
    lineHeight: `var(${GRID_ROW_HEIGHT})`,
    width: `var(${GRID_ROW_WIDTH})`,
  },
  td: {
    paddingLeft: 16,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "start",
  },
}

const numericStyles = {
  "&[data-is-numeric=true]": {
    textAlign: "right",
  },
}

const simpleVariant = (props: Dict) => {
  const { colorScheme: c } = props

  return {
    th: {
      color: mode(`gray.600`, `gray.400`)(props),
      borderBottom: "1px",
      borderColor: mode(`${c}.100`, `${c}.700`)(props),
      ...numericStyles,
    },
    td: {
      borderBottom: "1px",
      borderColor: mode(`${c}.100`, `${c}.700`)(props),
      ...numericStyles,
    },
  }
}

const stripedVariant = (props: Dict) => {
  const { colorScheme: c } = props

  return {
    th: {
      color: mode(`gray.600`, `gray.400`)(props),
      borderBottom: "1px",
      borderColor: mode(`${c}.100`, `${c}.700`)(props),
      ...numericStyles,
    },
    td: {
      borderBottom: "1px",
      borderColor: mode(`${c}.100`, `${c}.700`)(props),
      ...numericStyles,
    },
    caption: {
      color: mode(`gray.600`, `gray.100`)(props),
    },
    tbody: {
      tr: {
        "&:nth-of-type(odd)": {
          "th, td": {
            borderBottomWidth: "1px",
            borderColor: mode(`${c}.100`, `${c}.700`)(props),
          },
          td: {
            background: mode(`${c}.100`, `${c}.700`)(props),
          },
        },
      },
    },
    tfoot: {
      tr: {
        "&:last-of-type": {
          th: { borderBottomWidth: 0 },
        },
      },
    },
  }
}

const variants = {
  simple: simpleVariant,
  striped: stripedVariant,
  unstyled: {},
}

const sizes = {
  sm: {},
  md: {},
  lg: {},
}

const defaultProps = {
  variant: "simple",
  size: "md",
  colorScheme: "gray",
}

export default {
  parts,
  baseStyle,
  variants,
  sizes,
  defaultProps,
}
