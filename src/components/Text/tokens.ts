export const TEXT_FONTS = {
  serif: '"adobe-garamond-pro", "Times New Roman", Times, serif',
}

export const TEXT_FONT_SIZES = {
  size11: "72px",
  size10: "60px",
  size9: "48px",
  size8: "36px",
  size7: "30px",
  size6: "24px",
  size5: "20px",
  size4: "18px",
  size3: "16px",
  size2: "14px",
  size1: "12px",
}

export type TextFontSize = keyof typeof TEXT_FONT_SIZES

export const TEXT_LINE_HEIGHTS = {
  solid: 1,
  title: 1.25,
  body: 1.5,
}

export type TextLineHeight = keyof typeof TEXT_LINE_HEIGHTS

export const TEXT_LETTER_SPACING = {
  tight: "-0.02em",
  tightest: "-0.03em",
}

export type TextLetterSpacing = keyof typeof TEXT_LETTER_SPACING

export interface TextTreatment {
  fontSize: TextFontSize
  lineHeight: TextLineHeight
  letterSpacing?: TextLetterSpacing
  fontWeight?: "normal" | "bold"
}

export const TEXT_TREATMENTS = ["h1", "h2", "h3", "h4", "h5", "h6", "body", "body2", "caption"] as const

export type TextTreatments = {
  [K in typeof TEXT_TREATMENTS[number]]: TextTreatment
}

export const TEXT_VARIANTS: { [key: string]: TextTreatments } = {
  large: {
    h1: {
      fontSize: "size11",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h2: {
      fontSize: "size10",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h3: {
      fontSize: "size9",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h4: {
      fontSize: "size8",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h5: {
      fontSize: "size6",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h6: {
      fontSize: "size4",
      lineHeight: "title",
      fontWeight: "normal",
    },
    body: {
      fontSize: "size3",
      lineHeight: "title",
      fontWeight: "normal",
    },
    body2: {
      fontSize: "size2",
      lineHeight: "title",
      fontWeight: "normal",
    },
    caption: {
      fontSize: "size1",
      lineHeight: "title",
      fontWeight: "normal",
    },
  },
  small: {
    h1: {
      fontSize: "size11",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h2: {
      fontSize: "size10",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h3: {
      fontSize: "size9",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h4: {
      fontSize: "size8",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h5: {
      fontSize: "size6",
      lineHeight: "title",
      fontWeight: "normal",
    },
    h6: {
      fontSize: "size4",
      lineHeight: "title",
      fontWeight: "normal",
    },
    body: {
      fontSize: "size3",
      lineHeight: "title",
      fontWeight: "normal",
    },
    body2: {
      fontSize: "size2",
      lineHeight: "body",
      fontWeight: "normal",
    },
    caption: {
      fontSize: "size1",
      lineHeight: "title",
      fontWeight: "normal",
    },
  },
}

export type TextVariant = keyof TextTreatments

const sansFallback = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface FontDefinition {
  fontFamily: string
  fontWeight?: string | number
  fontStyle?: string
}

export type FontValue = string | FontDefinition

export interface FontFamily {
  sans: {
    regular: FontValue
    italic: FontValue
    medium: FontValue
    mediumItalic: FontValue
  }
  serif: {
    regular: FontValue
    italic: FontValue
    semibold: FontValue
  }
  display: {
    regular: FontValue
  }
}

export const FONT_FAMILY: FontFamily = {
  sans: {
    regular: `Unica77LLWebRegular, ${sansFallback}`,
    italic: {
      fontFamily: `Unica77LLWebItalic, ${sansFallback}`,
      fontStyle: "italic",
    },
    medium: {
      fontFamily: `Unica77LLWebMedium, ${sansFallback}`,
      fontWeight: 500,
    },
    mediumItalic: {
      fontFamily: `Unica77LLWebMediumItalic, ${sansFallback}`,
      fontWeight: 500,
      fontStyle: "italic",
    },
  },
  serif: {
    regular: "'Adobe Garamond W08', 'adobe-garamond-pro', 'AGaramondPro-Regular', 'Times New Roman', Times, serif",
    italic: {
      fontFamily: "'Adobe Garamond W08', 'adobe-garamond-pro', 'AGaramondPro-Regular', 'Times New Roman', Times, serif",
      fontStyle: "italic",
    },
    semibold: {
      fontFamily: "'Adobe Garamond W08', 'adobe-garamond-pro', 'AGaramondPro-Regular', 'Times New Roman', Times, serif",
      fontWeight: 600,
    },
  },
  display: {
    regular:
      "'ITC Avant Garde Gothic W04','AvantGardeGothicITCW01D 731075', AvantGardeGothicITCW01Dm, Helvetica, sans-serif",
  },
}
