import * as React from 'react'
import styled from 'styled-components'

import TextInput from '../../../components/TextInput'
import { Font, FontSizeName } from '@src/interfaces/styles'
import SymbolBox from '../../../components/SymbolBox'

const Wrapper = styled.div`
  display: flex;
`

const InputWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  margin-bottom: 20px;
`

const TopAllignedTextInput = styled(TextInput)`
  justify-content: flex-end;
`

interface ExampleTextProps {
  fontSize: string
  lineHeight: string
  font: Font
}

const ExampleText = styled.span`
  @import url('${({ font }: ExampleTextProps) => font.fontUrl}');
  font-family: '${({ font }: ExampleTextProps) => font.fontFamily}';
  font-size: ${({ fontSize }: ExampleTextProps) => fontSize};
  line-height: ${({ lineHeight }: ExampleTextProps) => lineHeight};
  margin-bottom: 38px;
  padding-left: 73px;
`

interface FontSizeRowProps {
  font: Font
  fontSizeName: FontSizeName
}

const onFontSizeChange = (font: Font, fontSizeName: FontSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  font.sizes[fontSizeName].fontSize = event.target.value
}

const onLineHeightChange = (font: Font, fontSizeName: FontSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  font.sizes[fontSizeName].lineHeight = event.target.value
}

const FontSizeRow = ({ font, fontSizeName }: FontSizeRowProps) => (
  <Wrapper>
    <InputWrapper>
      <SymbolBox>{fontSizeName}</SymbolBox>
      <TopAllignedTextInput
        name={`fontSize_${fontSizeName}`}
        label="Font Size"
        value={font.sizes[fontSizeName].fontSize}
        onChange={onFontSizeChange(font, fontSizeName)}
      />
      <TopAllignedTextInput
        name={`lineHeight_${fontSizeName}`}
        label="Line height"
        value={font.sizes[fontSizeName].lineHeight}
        onChange={onLineHeightChange(font, fontSizeName)}
      />
    </InputWrapper>
    <ExampleText
      font={font}
      fontSize={font.sizes[fontSizeName].fontSize}
      lineHeight={font.sizes[fontSizeName].lineHeight}
    >
      Lorem ipsum
    </ExampleText>
  </Wrapper>
)

export default FontSizeRow
