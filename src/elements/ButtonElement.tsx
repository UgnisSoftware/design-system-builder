import { Element } from '@src/interfaces/elements'
import { Alignment, NodeTypes, Overflow, Units } from '@src/interfaces/nodes'
import { FontSizeName } from '@src/interfaces/settings'
import { uuid } from '@src/utils'

export default (name): Element => {
  const newId = uuid()
  const newRootId = uuid()
  return {
    id: newId,
    name: name,
    root: {
      id: newRootId,
      type: NodeTypes.Root,
      nodeType: NodeTypes.Button,
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
      overflow: Overflow.visible,
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
          focus: {},
          hover: {},
          fontFamilyId: 'R1-123332',
        },
      ],
      backgroundColorId: 'prim-1',
      border: 'borbor-6666',
      boxShadow: 'shadow-7777',
      focus: {},
      hover: {},
    },
  }
}
