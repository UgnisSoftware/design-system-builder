import { Element, ElementType } from '@src/interfaces/elements'
import { Alignment, NodeTypes, Units } from '@src/interfaces/nodes'
import { uuid } from '@src/utils'

export default (name): Element => {
  const newId = uuid()
  const newRootId = uuid()
  const newBoxId = uuid()
  const newTextId = uuid()
  return {
    id: newId,
    type: ElementType.Button,
    name: name,
    root: {
      id: newRootId,
      type: NodeTypes.Root,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
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
      order: [newBoxId, newTextId],
      children: {
        [newBoxId]: {
          id: newBoxId,
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,
          backgroundColorId: 'prim-1',
          border: 'borbor-6666',
          boxShadow: 'shadow-7777',
          states: {
            hover: {},
            parentHover: {},
          },
        },
        [newTextId]: {
          id: newTextId,
          type: NodeTypes.Text,
          columnStart: 2,
          columnEnd: 3,
          rowStart: 2,
          rowEnd: 3,
          horizontalAlign: Alignment.center,
          verticalAlign: Alignment.center,
          text: 'Button',
          fontColorId: 'white-6666',
          fontSize: 'S',
          fontFamilyId: 'R1-123332',
          states: {
            hover: {},
            parentHover: {},
          },
        },
      },
    },
    modifiers: {
      Disabled: {
        order: [newBoxId, newTextId],
        children: {
          [newBoxId]: {
            backgroundColorId: 'cccc-3333-2',
          },
        },
      },
    },
  }
}
