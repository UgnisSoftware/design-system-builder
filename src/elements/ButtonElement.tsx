import { Element, ElementType } from '@src/interfaces/elements'
import { Alignment, NodeTypes, Units } from '@src/interfaces/nodes'
import { FontSizeName } from '@src/interfaces/settings'
import { uuid } from '@src/utils'

export default (name): Element => {
  const newId = uuid()
  const newRootId = uuid()
  return {
    id: newId,
    type: ElementType.Button,
    name: name,
    root: {
      id: newRootId,
      type: NodeTypes.Root,
      position: {
        columnStart: 1,
        columnEnd: -1,
        rowStart: 1,
        rowEnd: -1,
      },
      alignment: {
        horizontal: Alignment.stretch,
        vertical: Alignment.stretch,
      },
      columns: [
        {
          value: 12,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 12,
          unit: Units.Px,
        },
      ],
      rows: [
        {
          value: 8,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 8,
          unit: Units.Px,
        },
      ],
      children: [
        {
          id: '2345553c774',
          type: NodeTypes.Box,
          position: {
            columnStart: 1,
            columnEnd: -1,
            rowStart: 1,
            rowEnd: -1,
          },
          alignment: {
            horizontal: Alignment.stretch,
            vertical: Alignment.stretch,
          },
          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'prim-1',
          border: 'borbor-6666',
          boxShadow: 'shadow-7777',
        },
        {
          id: '55a53c774',
          type: NodeTypes.Text,
          position: {
            columnStart: 2,
            columnEnd: 3,
            rowStart: 2,
            rowEnd: 3,
          },
          alignment: {
            horizontal: Alignment.center,
            vertical: Alignment.center,
          },
          text: 'Button',
          fontColorId: 'white-6666',
          fontSize: FontSizeName.S,
          states: {
            hover: {},
            parentHover: {},
          },
          fontFamilyId: 'R1-123332',
        },
      ],
      states: {
        secondary: {},
      },
    },
  }
}
