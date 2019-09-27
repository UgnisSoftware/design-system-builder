import { proxify } from 'lape'
import { Alignment, NodeTypes, ObjectFit, Units } from '@src/interfaces/nodes'
import { Element, ElementType } from '@src/interfaces/elements'

const defaultState: Element[] = [
  {
    id: 'button1',
    type: ElementType.Button,
    name: 'Button',
    root: {
      id: 'button2',
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
      order: ['2345553c774', '55a53c774'],
      children: {
        '2345553c774': {
          id: '2345553c774',
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
        '55a53c774': {
          id: '55a53c774',
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
        order: ['2345553c774', '55a53c774'],
        children: {
          '2345553c774': {
            backgroundColorId: 'cccc-3333-2',
          },
        },
      },
    },
  },
  {
    id: 'textInput-1234',
    type: ElementType.TextInput,
    name: 'Input',
    root: {
      id: 'oijsadoijas-12323',
      type: NodeTypes.Root,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,

      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,

      columns: [
        {
          value: 1,
          unit: Units.Fr,
        },
      ],
      rows: [
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
      ],
      order: ['asd33215553c774', 'ef3fb8266', 'as5491d89'],
      children: {
        asd33215553c774: {
          id: 'asd33215553c774',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,

          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,

          states: {
            hover: {},
            parentHover: {},
          },

          backgroundColorId: null,
          border: null,
          boxShadow: null,
        },
        ef3fb8266: {
          id: 'ef3fb8266',
          type: NodeTypes.Text,
          columnStart: 1,
          columnEnd: 2,
          rowStart: 1,
          rowEnd: 2,

          horizontalAlign: Alignment.start,
          verticalAlign: Alignment.center,

          text: 'Label',
          fontSize: 'S',
          states: {
            hover: {},
            parentHover: {},
          },
          fontFamilyId: 'R1-123332',
        },
        as5491d89: {
          id: 'as5491d89',
          type: NodeTypes.Input,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 2,
          rowEnd: 3,

          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,

          backgroundColorId: 'cccc-3333',
          border: 'borbor-8888',
          boxShadow: null,
          states: {
            focus: {},
            hover: {},
            parentHover: {},
          },
        },
      },
    },
    modifiers: {},
  },
  {
    id: 'select-1234',
    type: ElementType.Select,
    name: 'Select',
    root: null,
    modifiers: {},
  },
  {
    id: 'slider-1234',
    type: ElementType.Slider,
    name: 'Slider',
    root: {
      id: 'oijsawefdoijas-12323',
      type: NodeTypes.Root,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      columns: [
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 24,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
      ],
      rows: [
        {
          value: 11,
          unit: Units.Px,
        },
        {
          value: 2,
          unit: Units.Px,
        },
        {
          value: 11,
          unit: Units.Px,
        },
      ],
      order: ['asd33215553c774', 'ef3fb2348266', 'ef3fsdfb8266', 'ef3ghvhfb8266'],
      children: {
        asd33215553c774: {
          id: 'asd33215553c774',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,
          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: null,
          border: null,
          boxShadow: null,
        },
        ef3fb2348266: {
          id: 'ef3fb2348266',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: 3,
          rowStart: 2,
          rowEnd: 3,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.center,
          border: 'borbor-6666',
          boxShadow: null,
          backgroundColorId: 'prim-1',
          states: {
            parentHover: {},
            hover: {},
          },
        },
        ef3fsdfb8266: {
          id: 'ef3fsdfb8266',
          type: NodeTypes.Box,
          columnStart: 2,
          columnEnd: 4,
          rowStart: 2,
          rowEnd: 3,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.center,
          border: 'borbor-6666',
          boxShadow: null,
          backgroundColorId: 'dddd-4444',
          states: {
            parentHover: {},
            hover: {},
          },
        },
        ef3ghvhfb8266: {
          id: 'ef3ghvhfb8266',
          type: NodeTypes.Box,
          columnStart: 2,
          columnEnd: 3,
          rowStart: 1,
          rowEnd: 4,
          horizontalAlign: Alignment.center,
          verticalAlign: Alignment.center,
          border: 'borbor-9999',
          boxShadow: 'shadow-5555',
          backgroundColorId: 'white-6666',
          states: {
            parentHover: {},
            hover: {},
          },
        },
      },
    },
    modifiers: {},
  },
  {
    id: 'checkbox-1234',
    type: ElementType.CheckBox,
    name: 'Checkbox',
    root: {
      id: 'oijsawefdoijas-12323',
      type: NodeTypes.Root,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      columns: [
        {
          value: 24,
          unit: Units.Px,
        },
      ],
      rows: [
        {
          value: 24,
          unit: Units.Px,
        },
      ],
      order: ['oijqwe12333'],
      children: {
        oijqwe12333: {
          id: 'oijqwe12333',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,
          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'white-6666',
          border: 'primB-1',
          boxShadow: null,
        },
      },
    },
    modifiers: {
      Checked: {
        order: ['oijqwe12333', 'weyfiwedj1234'],
        children: {
          weyfiwedj1234: {
            id: 'weyfiwedj1234',
            type: NodeTypes.Icon,
            columnStart: 1,
            columnEnd: -1,
            rowStart: 1,
            rowEnd: -1,
            horizontalAlign: Alignment.center,
            verticalAlign: Alignment.center,
            states: {
              hover: {},
              parentHover: {},
            },
            fontColorId: 'prim-1',
            fontSize: 'M',
            iconType: 'check',
          },
        },
      },
      Disabled: {
        order: ['oijqwe12333'],
        children: {
          oijqwe12333: {
            border: 'borbor-8888',
          },
        },
      },
      DisabledChecked: {
        order: ['oijqwe12333', 'weyfiwedj1234'],
        children: {
          oijqwe12333: {
            border: 'borbor-8888',
          },
          weyfiwedj1234: {
            id: 'weyfiwedj1234',
            type: NodeTypes.Icon,
            columnStart: 1,
            columnEnd: -1,
            rowStart: 1,
            rowEnd: -1,
            horizontalAlign: Alignment.center,
            verticalAlign: Alignment.center,
            states: {
              hover: {},
              parentHover: {},
            },
            fontColorId: 'cccc-3333-2',
            fontSize: 'M',
            iconType: 'check',
          },
        },
      },
    },
  },
  {
    id: 'switch-1234',
    type: ElementType.CheckBox,
    name: 'Switch',
    root: {
      id: 'im2od23d-12323',
      type: NodeTypes.Root,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      columns: [
        {
          value: 3,
          unit: Units.Px,
        },
        {
          value: 17,
          unit: Units.Px,
        },
        {
          value: 17,
          unit: Units.Px,
        },
        {
          value: 3,
          unit: Units.Px,
        },
      ],
      rows: [
        {
          value: 3,
          unit: Units.Px,
        },
        {
          value: 14,
          unit: Units.Px,
        },
        {
          value: 3,
          unit: Units.Px,
        },
      ],
      order: ['doim2i3dm', 'oisdjnd12334'],
      children: {
        doim2i3dm: {
          id: 'doim2i3dm',
          type: NodeTypes.Box,
          columnStart: 2,
          columnEnd: 4,
          rowStart: 2,
          rowEnd: 3,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,
          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'cccc-3333-2',
          border: 'borbor-5555',
          boxShadow: null,
        },
        oisdjnd12334: {
          id: 'oisdjnd12334',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: 3,
          rowStart: 1,
          rowEnd: -1,
          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,
          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'white-6666',
          border: 'borbor-9999',
          boxShadow: 'shadow-5555',
        },
      },
    },
    modifiers: {
      Checked: {
        order: ['doim2i3dm', 'oisdjnd12334'],
        children: {
          doim2i3dm: {
            backgroundColorId: 'dddd-4444',
          },
          oisdjnd12334: {
            backgroundColorId: 'prim-1',
            columnStart: 3,
            columnEnd: 5,
          },
        },
      },
      Disabled: {
        order: ['doim2i3dm', 'oisdjnd12334'],
        children: {
          doim2i3dm: {
            backgroundColorId: 'cccc-3333-3',
          },
          oisdjnd12334: {
            backgroundColorId: 'cccc-3333-2',
          },
        },
      },
      DisabledChecked: {
        order: ['doim2i3dm', 'oisdjnd12334'],
        children: {
          doim2i3dm: {
            backgroundColorId: 'cccc-3333-3',
          },
          oisdjnd12334: {
            backgroundColorId: 'cccc-3333-2',
            columnStart: 3,
            columnEnd: 5,
          },
        },
      },
    },
  },
  {
    id: 'radio-1234',
    type: ElementType.CheckBox,
    name: 'Radio Button',
    root: null,
    modifiers: {},
  },
  {
    id: 'link-1234',
    type: ElementType.Link,
    name: 'Link',
    root: null,
    modifiers: {},
  },
  {
    id: 'AppBar',
    type: ElementType.Component,
    name: 'App bar',
    root: {
      id: 'rootId',
      type: NodeTypes.Root,
      columns: [
        {
          value: 40,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 70,
          unit: Units.Px,
        },
      ],
      rows: [
        {
          value: 50,
          unit: Units.Px,
        },
      ],
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      order: ['2231553c774', 'start123', 'message123', 'log123'],
      children: {
        '2231553c774': {
          id: '2231553c774',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,

          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,

          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'prim-1',
          border: null,
        },
        start123: {
          id: 'start123',
          type: NodeTypes.Icon,
          iconType: 'menu',
          fontColorId: 'white-6666',
          fontSize: 'M',
          columnStart: 1,
          columnEnd: 1,
          rowStart: 1,
          rowEnd: 1,

          horizontalAlign: Alignment.center,
          verticalAlign: Alignment.center,

          states: {
            parentHover: {},
            hover: {},
          },
        },
        message123: {
          id: 'message123',
          type: NodeTypes.Text,
          columnStart: 2,
          columnEnd: 3,
          rowStart: 1,
          rowEnd: 1,
          fontSize: 'M',
          fontColorId: 'white-6666',
          horizontalAlign: Alignment.start,
          verticalAlign: Alignment.center,
          text: 'Menu',
          states: {
            parentHover: {},
            hover: {},
          },
          fontFamilyId: 'R1-123332',
        },
        log123: {
          id: 'log123',
          type: NodeTypes.Text,
          columnStart: 3,
          columnEnd: 3,
          rowStart: 1,
          rowEnd: 1,
          fontSize: 'S',
          fontColorId: 'white-6666',
          horizontalAlign: Alignment.start,
          verticalAlign: Alignment.center,
          text: 'Log in',
          states: {
            parentHover: {},
            hover: {},
          },
          fontFamilyId: 'R1-123332',
        },
      },
    },
    modifiers: {},
  },
  {
    id: 'abcd-1234',
    type: ElementType.Component,
    name: 'Card',
    root: {
      id: 'rootId',
      type: NodeTypes.Root,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
      columns: [
        {
          value: 1,
          unit: Units.Fr,
        },
      ],
      rows: [
        {
          value: 500,
          unit: Units.Px,
        },
        {
          value: 80,
          unit: Units.Px,
        },
      ],
      order: ['a123345553c774', 's07f083fc0', 'ef3fb4266', 'ef3f5b266'],
      children: {
        a123345553c774: {
          id: 'a123345553c774',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,

          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,

          states: {
            hover: {},
            parentHover: {},
          },
          backgroundColorId: 'cccc-3333',
          border: 'barbar-7777',
          boxShadow: 'shadow-9999',
        },
        s07f083fc0: {
          id: 's07f083fc0',
          type: NodeTypes.Box,
          columnStart: 1,
          columnEnd: 2,
          rowStart: 1,
          rowEnd: 2,

          horizontalAlign: Alignment.stretch,
          verticalAlign: Alignment.stretch,

          backgroundImageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
          backgroundImagePosition: ObjectFit.fill,
          border: null,
          states: {
            hover: {},
            parentHover: {},
          },
        },
        ef3fb4266: {
          id: 'ef3fb4266',
          type: NodeTypes.Text,
          columnStart: 1,
          columnEnd: 2,
          rowStart: 2,
          rowEnd: 3,

          horizontalAlign: Alignment.center,
          verticalAlign: Alignment.center,
          text: 'Nebula c51-b9',
          fontSize: 'L',
          states: {
            hover: {},
            parentHover: {},
          },
          fontFamilyId: 'R1-123332',
        },
        ef3f5b266: {
          id: 'ef3f5b266',
          type: NodeTypes.Element,
          elementId: 'button1',
          columnStart: 1,
          columnEnd: 2,
          rowStart: 2,
          rowEnd: 3,

          horizontalAlign: Alignment.center,
          verticalAlign: Alignment.center,

          overrides: {},
          states: {},
        },
      },
    },
    modifiers: {},
  },
]

export default proxify(defaultState)
