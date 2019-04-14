import { proxify } from 'lape'
import { State } from '@src/Interfaces/state'
import { RouterPaths } from '@src/interfaces/router'
import { FontSizeName } from '@src/Interfaces/fonts'
import { Alignment, NodeTypes, ObjectFit, Overflow, Units } from '@src/Interfaces/nodes'

const defaultState: State = {
  elements: {
    Button: {
      Primary: {
        id: 'rootId',
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
        padding: {
          top: '8px',
          left: '16px',
          bottom: '8px',
          right: '16px',
        },
        overflow: Overflow.visible,
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
        ],
        children: [
          {
            id: '55a3c774',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
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
          },
        ],
        background: {
          colorId: 'prim-1',
        },
        border: 'borbor-6666',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
      Secondary: {
        id: 'rootId',
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
        padding: {
          top: '8px',
          left: '16px',
          bottom: '8px',
          right: '16px',
        },
        overflow: Overflow.visible,
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
        ],
        children: [
          {
            id: '55a3c774',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
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
          },
        ],
        background: {
          colorId: 'secn-1',
        },
        border: 'borbor-6666',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
    },
    Input: {
      'Text Input': {
        id: 'rootId',
        type: NodeTypes.Root,
        nodeType: NodeTypes.Box,
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
        padding: {
          top: '8px',
          left: '16px',
          bottom: '8px',
          right: '16px',
        },
        overflow: Overflow.visible,
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
        background: {
          colorId: 'cccc-3333',
        },
        border: 'borbor-6666',
        boxShadow: null,
        focus: {},
        hover: {},
        children: [
          {
            id: 'ef3fb266',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.start,
              vertical: Alignment.center,
            },
            text: 'Label',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
          {
            id: 'as541d89',
            type: NodeTypes.Input,
            position: {
              columnStart: 1,
              columnEnd: -1,
              rowStart: 2,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.stretch,
            },
            background: {
              colorId: 'cccc-3333',
            },
            border: 'borbor-8888',
            boxShadow: null,
            focus: {},
            hover: {},
          },
        ],
      },
    },
    Dropdown: {
      default: {
        input: {
          id: 'rootId',
          type: NodeTypes.Root,
          nodeType: NodeTypes.Box,
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
          padding: {
            top: '8px',
            left: '16px',
            bottom: '8px',
            right: '16px',
          },
          overflow: Overflow.visible,
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
          ],
          background: {
            colorId: 'cccc-3333',
          },
          border: 'borbor-6666',
          boxShadow: 'shadow-7777',
          focus: {},
          hover: {},
          children: [],
        },
        menu: {
          id: 'rootId',
          type: NodeTypes.Root,
          nodeType: NodeTypes.Box,
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
          padding: {
            top: '8px',
            left: '16px',
            bottom: '8px',
            right: '16px',
          },
          overflow: Overflow.visible,
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
          ],
          background: {
            colorId: 'cccc-3333',
          },
          border: 'borbor-6666',
          boxShadow: 'shadow-7777',
          focus: {},
          hover: {},
          children: [],
        },
      },
    },

    /* Checkbox: {
      default: {
          id: 'rootId',
          type: NodeTypes.Root,
          nodeType: NodeTypes.Box,
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
          padding: {
            top: '8px',
            left: '16px',
            bottom: '8px',
            right: '16px',
          },
          overflow: Overflow.visible,
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
          background: {
            colorId: 'cccc-3333',
          },
          border: null,
          boxShadow: null,
          focus: {},
          hover: {},
          children: [
            {
              id: 'ef3fb266',
              type: NodeTypes.Icon,
              iconType: 'check_box',
              position: {
                columnStart: 1,
                columnEnd: 2,
                rowStart: 1,
                rowEnd: 2,
              },
              alignment: {
                horizontal: Alignment.center,
                vertical: Alignment.center,
              },
              focus: {},
              hover: {},
            },
        ],
      },
    }, */

    /*Chips: {
      Primary: {
        id: 'rootId',
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
        padding: {
          top: '8px',
          left: '16px',
          bottom: '8px',
          right: '16px',
        },
        overflow: Overflow.visible,
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
        ],
        children: [
          {
            id: '55a3c774',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            text: 'Primary Clickable Chip',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
          {
            id: 'chipIcon'
            type: NodeTypes.Icon
            iconType: 'close',
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
            focus: {},
            hover: {},
          },
        ],
        background: {
          colorId: 'prim-1',
        },
        border: 'primB-1',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
      Secondary: {
        id: 'rootId',
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
        padding: {
          top: '8px',
          left: '16px',
          bottom: '8px',
          right: '16px',
        },
        overflow: Overflow.visible,
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
        ],
        children: [
          {
            id: '55a3c774',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            text: 'Secondary Clickable Chip',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
          {
            id: 'chipIcon'
            type: NodeTypes.Icon
            iconType: 'close',
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
            focus: {},
            hover: {},
          },
        ],
        background: {
          colorId: 'secn-1',
        },
        border: 'primB-1',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
    }, */
    /* Snackbar: {
      alert: {
        id: 'rootId',
        type: NodeTypes.Root,
        NodeType: NodeTypes.Box,
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
        padding: {
          top: '20px',
          bottom: '20px',
          left: '10px',
          right: '10px',
        },
        overflow: Overflow.visible,
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
        ],
        children: [
          {
            id: 'doesThisMatter',
            nodeType: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.start,
              vertical: Alignment.center,
            },
            text: 'This is an alert',
            fontSize: FontSizeName.S,
            color: {
              colorId: 'prim-1',
            },
            focus: {},
            hover: {},
          },
          {
            id: 'doesThisAlsoMatter',
            nodeType: NodeTypes.Button,
            position: {
              columnStart: 3,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.end,
              vertical: Alignment.center,
            },
            fontSize: FontSizeName.S,
            color: {
              colorId: 'secn-1',
            },
            text: 'Lorem ipsum',
          },
        ],
        background: {
          colorId: 'bbbb-2222'
        },
        border: 'primB-1',
        hover: {},
        focus: {},
      },
    }, */
    /* AppBar: {
    id: 'AppBar',
    type: NodeTypes.Root,
    nodeType: NodeTypes.Box,
    position: {
      columnStart: 1,
      columnEnd: -1,
      rowStart: 1,
      rowEnd: -1,
    },
    alignment:
      {
        horizontal: Alignment.stretch,
        vertical: Alignment.stretch,
      },
    padding:
      {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
    overflow: Overflow.visible,
    rows: [
      {
      value: 1,
      unit: Units.Fr,
    },
    ],
    columns: [
      {
        value: 1,
        unit: Units.Fr,
      },
      {
        value: 1,
        unit: Units.Fr,
      },
      {
        value: 1.
        unit: Units.Fr,
      },
    ],
    background: {
      colorId: 'prim-1'
    },

  } */
  },
  components: {
    'abcd-1234': {
      id: 'abcd-1234',
      name: 'Card',
      root: {
        id: 'rootId',
        type: NodeTypes.Root,
        nodeType: NodeTypes.Box,
        alignment: {
          horizontal: Alignment.stretch,
          vertical: Alignment.stretch,
        },
        position: {
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
        },
        padding: {
          top: '0px',
          left: '0px',
          bottom: '0px',
          right: '0px',
        },
        overflow: Overflow.visible,
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
        children: [
          {
            id: '07f08fc0',
            type: NodeTypes.Image,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.stretch,
            },
            imageUrl:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
            objectFit: ObjectFit.cover,
            focus: {},
            hover: {},
          },
          {
            id: 'ef3fb266',
            type: NodeTypes.Text,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 2,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            text: 'Nebula c51-b9',
            fontSize: FontSizeName.L,
            focus: {},
            hover: {},
          },
          {
            id: 'ef3fb266',
            type: NodeTypes.Element,
            elementType: 'Input',
            elementId: 'Text Input',
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 2,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            overrides: {},
          },
        ],
        background: {
          colorId: 'cccc-3333',
        },
        border: 'barbar-7777',
        boxShadow: 'shadow-9999',
        focus: {},
        hover: {},
      },
    },
    'efgh-5678': {
      id: 'efgh-5678',
      name: 'Table-test',
      root: {
        id: 'rootId',
        type: NodeTypes.Root,
        nodeType: NodeTypes.Box,
        alignment: {
          horizontal: Alignment.stretch,
          vertical: Alignment.stretch,
        },
        position: {
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
        },
        padding: {
          top: '0px',
          left: '0px',
          bottom: '0px',
          right: '0px',
        },
        overflow: Overflow.hidden,
        columns: [
          {
            value: 1,
            unit: Units.Fr,
          },
          {
            value: 1,
            unit: Units.Fr,
          },
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        rows: [
          {
            value: 80,
            unit: Units.Px,
          },
          {
            value: 80,
            unit: Units.Px,
          },
          {
            value: 80,
            unit: Units.Px,
          },
        ],
        background: {
          colorId: 'cccc-3333',
        },
        border: 'primB-1',
        focus: {},
        hover: {},
        children: [
          {
            id: 'test1',
            type: NodeTypes.Text,
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 2,
            },
            text: 'Primary',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
          {
            id: 'test2',
            type: NodeTypes.Text,
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            position: {
              columnStart: 2,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 2,
            },
            text: 'Secondary',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
          {
            id: 'test3',
            type: NodeTypes.Image,
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            position: {
              columnStart: 3,
              columnEnd: 4,
              rowStart: 1,
              rowEnd: 2,
            },
            focus: {},
            hover: {},
            imageUrl:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
            objectFit: ObjectFit.fill,
          },
          {
            id: 'test4',
            type: NodeTypes.Element,
            elementId: 'Text Input',
            elementType: 'Input',
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 2,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            overrides: {},
          },
          {
            id: 'test5',
            type: NodeTypes.Box,
            position: {
              columnStart: 2,
              columnEnd: 3,
              rowStart: 2,
              rowEnd: 3,
            },
            border: 'borbor-6666',
            background: {
              colorId: 'secn-1',
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.stretch,
            },
            focus: {},
            hover: {},
          },
          {
            id: 'test5-1',
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
            fontSize: FontSizeName.M,
            text: 'Middle',
            focus: {},
            hover: {},
          },
          {
            id: 'test-6',
            type: NodeTypes.Box,
            position: {
              columnStart: 3,
              columnEnd: -1,
              rowStart: 2,
              rowEnd: -1,
            },
            border: 'borbor-6666',
            background: {
              colorId: 'prim-1',
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.stretch,
            },
            focus: {},
            hover: {
              background: {
                colorId: 'secn-1',
              },
            },
          },
          {
            id: 'test-7',
            type: NodeTypes.Icon,
            iconType: 'bug_report',
            position: {
              columnStart: 1,
              columnEnd: 3,
              rowStart: 3,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            hover: {},
            focus: {},
          },
        ],
      },
    },
    AppBar: {
      id: 'AppBar',
      name: 'App bar test',
      root: {
        id: 'rootId',
        type: NodeTypes.Root,
        nodeType: NodeTypes.Box,
        overflow: Overflow.visible,
        padding: {
          top: '5px',
          bottom: '5px',
          left: '10px',
          right: '10px',
        },
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
        position: {
          columnStart: 1,
          columnEnd: -1,
          rowStart: 1,
          rowEnd: -1,
        },
        background: {
          colorId: 'prim-1',
        },
        border: null,
        alignment: {
          horizontal: Alignment.stretch,
          vertical: Alignment.stretch,
        },
        focus: {},
        hover: {},
        children: [
          {
            id: 'start',
            type: NodeTypes.Icon,
            iconType: 'menu',
            position: {
              columnStart: 1,
              columnEnd: 1,
              rowStart: 1,
              rowEnd: 1,
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            focus: {},
            hover: {},
          },
          {
            id: 'message',
            type: NodeTypes.Text,
            position: {
              columnStart: 2,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 1,
            },
            fontSize: FontSizeName.M,
            fontColorId: 'white-6666',
            alignment: {
              horizontal: Alignment.start,
              vertical: Alignment.center,
            },
            text: 'Menu',
            focus: {},
            hover: {},
          },
          {
            id: 'log',
            type: NodeTypes.Text,
            position: {
              columnStart: 3,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 1,
            },
            fontSize: FontSizeName.S,
            fontColorId: 'white-6666',
            alignment: {
              horizontal: Alignment.start,
              vertical: Alignment.center,
            },
            text: 'Log in',
            focus: {},
            hover: {},
          },
        ],
      },
    },
  },
  colors: [
    {
      id: 'prim-1',
      name: 'Primary',
      hex: '#2196f3', //Primary color used in Material UI
    },
    {
      id: 'secn-1',
      name: 'Secondary',
      hex: '#e3004d', //Secondary color used in Material UI
    },
    {
      id: 'aaaa-1111',
      name: 'Pink',
      hex: '#f78888',
    },
    {
      id: 'bbbb-2222',
      name: 'Yellow',
      hex: '#f3d250',
    },
    {
      id: 'cccc-3333',
      name: 'Light grey',
      hex: '#f8f8f8',
    },
    {
      id: 'cccc-3333-2',
      name: 'Grey',
      hex: '#f0f0f0',
    },
    {
      id: 'dddd-4444',
      name: 'Light blue',
      hex: '#90ccf4',
    },
    {
      id: 'eeee-5555',
      name: 'Blue',
      hex: '#5da2d5',
    },
    {
      id: 'white-6666',
      name: 'White',
      hex: '#ffffff',
    },
  ],
  spacing: ['8px', '16px', '24px', '48px', '64px'],
  boxShadow: [
    {
      id: 'shadow-9999',
      value: '0 10px 20px hsla(0, 0%, 0%,.15), 0 3px 6px hsla(0, 0%, 0%, .10);',
    },
    {
      id: 'shadow-8888',
      value: '0 0 20px rgba(0,0,0,0.8);',
    },
    {
      id: 'shadow-7777',
      value: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12);',
    },
    {
      id: 'shadow-6666',
      value: 'inset 0 0 10px #4a4a4a',
    },
  ],
  border: [
    {
      id: 'primB-1',
      radius: '16px',
      style: '1px solid rgba(0, 0, 0, 0.23)', //Primary border used in MaterialUI
    },
    {
      id: 'borbor-6666',
      radius: '4px 4px 4px 4px',
      style: 'none',
    },
    {
      id: 'barbar-7777',
      radius: '0px 149px 0px 51px',
      style: '',
    },
    {
      id: 'borbor-8888',
      radius: '4px 4px 4px 4px',
      style: '1px solid rgba(0, 0, 0, 0.23);',
    },
  ],
  font: {
    fontName: 'Roboto',
    fontUrl: 'https://fonts.googleapis.com/css?family=Roboto',
    sizes: {
      [FontSizeName.XS]: {
        fontSize: '12px',
        lineHeight: '1.2em',
      },
      [FontSizeName.S]: {
        fontSize: '16px',
        lineHeight: '1.2em',
      },
      [FontSizeName.M]: {
        fontSize: '24px',
        lineHeight: '1.2em',
      },
      [FontSizeName.L]: {
        fontSize: '38px',
        lineHeight: '1.2em',
      },
      [FontSizeName.XL]: {
        fontSize: '50px',
        lineHeight: '1.2em',
      },
    },
  },
  ui: {
    router: {
      path: RouterPaths.component,
      componentId: 'abcd-1234',
    },
    editingColorId: '',
    editingTextNode: null,
    editingBoxNode: null,
    addingComponent: false,
    showAddComponentMenu: false,
    addingAtom: null,
    hoveredCell: null,
    selectedNode: null,
    expandingNode: null,
    draggingNodePosition: null,
    stateManager: null,
  },
}

export default proxify(defaultState)
