import { proxify } from 'lape'
import { State } from '@src/interfaces/state'
import { FontSizeName } from '@src/interfaces/settings'
import { Alignment, NodeTypes, ObjectFit, Units } from '@src/interfaces/nodes'
import { parseUrl } from '@src/utils'
import { ElementType } from '@src/interfaces/elements'

// const mergeSaved = JSON.parse(localStorage.getItem('state')) || {}
const defaultState: State = {
  elements: [
    {
      id: 'button1',
      type: ElementType.Button,
      name: 'Button',
      root: {
        id: 'button2',
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
    },
    {
      id: 'textInput-1234',
      type: ElementType.TextInput,
      name: 'Input',
      root: {
        id: 'oijsadoijas-12323',
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
        states: {
          focus: {},
          hover: {},
          disabled: {},
          error: {},
          warning: {},
        },
        children: [
          {
            id: 'asd33215553c774',
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

            backgroundColorId: null,
            border: null,
            boxShadow: null,
          },
          {
            id: 'ef3fb8266',
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
            states: {
              hover: {},
              parentHover: {},
            },
            fontFamilyId: 'R1-123332',
          },
          {
            id: 'as5491d89',
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
            backgroundColorId: 'cccc-3333',
            border: 'borbor-8888',
            boxShadow: null,
            states: {
              focus: {},
              hover: {},
              parentHover: {},
            },
          },
        ],
      },
    },

    {
      id: 'select-1234',
      type: ElementType.Select,
      name: 'Select',
      root: null,
    },

    {
      id: 'slider-1234',
      type: ElementType.Slider,
      name: 'Slider',
      root: {
        id: 'oijsawefdoijas-12323',
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
            value: 13,
            unit: Units.Px,
          },
          {
            value: 13,
            unit: Units.Px,
          },
        ],
        states: {},
        children: [
          {
            id: 'asd33215553c774',
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
            backgroundColorId: null,
            border: null,
            boxShadow: null,
          },
          {
            id: 'ef3fb2348266',
            type: NodeTypes.Box,
            position: {
              columnStart: 1,
              columnEnd: 2,
              rowStart: 1,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.center,
            },
            height: 2,
            border: 'borbor-6666',
            boxShadow: null,
            backgroundColorId: 'prim-1',
            states: {
              parentHover: {},
              hover: {},
            },
          },
          {
            id: 'ef3fsdfb8266',
            type: NodeTypes.Box,
            position: {
              columnStart: 2,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 3,
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.center,
            },
            height: 2,
            border: 'borbor-6666',
            boxShadow: null,
            backgroundColorId: 'dddd-4444',
            states: {
              parentHover: {},
              hover: {},
            },
          },
          {
            id: 'ef3ghvhfb8266',
            type: NodeTypes.Box,
            position: {
              columnStart: 1,
              columnEnd: 3,
              rowStart: 1,
              rowEnd: 4,
            },
            width: 24,
            height: 24,
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
            },
            border: 'borbor-9999',
            boxShadow: 'shadow-5555',
            backgroundColorId: 'white-6666',
            states: {
              parentHover: {},
              hover: {},
            },
          },
        ],
      },
    },
    {
      id: 'checkbox-1234',
      type: ElementType.CheckBox,
      name: 'Checkbox',
      root: null,
    },
    {
      id: 'switch-1234',
      type: ElementType.CheckBox,
      name: 'Switch',
      root: null,
    },
    {
      id: 'radio-1234',
      type: ElementType.Radio,
      name: 'Radio Button',
      root: null,
    },
    {
      id: 'link-1234',
      type: ElementType.Link,
      name: 'Link',
      root: null,
    },
    {
      id: 'loader-1234',
      type: ElementType.Loader,
      name: 'Loader',
      root: null,
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
        states: {},
        children: [
          {
            id: '2231553c774',
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
            border: null,
          },
          {
            id: 'start',
            type: NodeTypes.Icon,
            iconType: 'menu',
            fontColorId: 'white-6666',
            fontSize: FontSizeName.M,
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
            states: {
              parentHover: {},
              hover: {},
            },
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
            states: {
              parentHover: {},
              hover: {},
            },
            fontFamilyId: 'R1-123332',
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
            states: {
              parentHover: {},
              hover: {},
            },
            fontFamilyId: 'R1-123332',
          },
        ],
      },
    },
    {
      id: 'abcd-1234',
      type: ElementType.Component,
      name: 'Card',
      root: {
        id: 'rootId',
        type: NodeTypes.Root,
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
            id: '123345553c774',
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
            backgroundColorId: 'cccc-3333',
            border: 'barbar-7777',
            boxShadow: 'shadow-9999',
          },
          {
            id: '07f083fc0',
            type: NodeTypes.Box,
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
            backgroundImageUrl:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
            backgroundImagePosition: ObjectFit.fill,
            border: null,
            states: {
              hover: {},
              parentHover: {},
            },
          },
          {
            id: 'ef3fb4266',
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
            states: {
              hover: {},
              parentHover: {},
            },
            fontFamilyId: 'R1-123332',
          },
          {
            id: 'ef3f5b266',
            type: NodeTypes.Element,
            elementId: 'button1',
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
            states: {},
          },
        ],
        states: {},
      },
    },
  ],
  settings: {
    colors: [
      {
        id: 'dddd-4444',
        name: 'Light blue',
        hex: '#add1f5',
      },
      {
        id: 'eeee-5555',
        name: 'Blue',
        hex: '#5da2d5',
      },
      {
        id: 'prim-1',
        name: 'Primary',
        hex: '#2196f3',
      },
      {
        id: 'prim-2',
        name: 'StrongPrimary',
        hex: '#1976d2',
      },
      {
        id: 'aaaa-1111',
        name: 'Pink',
        hex: '#f78888',
      },
      {
        id: 'secn-1',
        name: 'Secondary',
        hex: '#e3004d',
      },
      {
        id: 'secn-2',
        name: 'StrongSecondary',
        hex: '#9d0038',
      },
      {
        id: 'bbbb-2222',
        name: 'Yellow',
        hex: '#f3d250',
      },
      {
        id: 'white-6666',
        name: 'White',
        hex: '#ffffff',
      },
      {
        id: 'cccc-3333',
        name: 'Light grey500',
        hex: '#f8f8f8',
      },
      {
        id: 'cccc-3333-2',
        name: 'Grey',
        hex: '#bfbfbf',
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
        id: 'shadow-5555',
        value: '0 3px 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.02);',
      },
      {
        id: 'shadow-6666',
        value: 'inset 0 0 10px #4a4a4a',
      },
    ],
    border: [
      {
        id: 'primB-1',
        radius: '4px',
        style: '1px solid #2196f3',
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
      {
        id: 'borbor-9999',
        radius: '50%',
        style: 'none',
      },
    ],
    fonts: [
      {
        id: 'R1-123332',
        fontFamily: 'Roboto',
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
      {
        id: 'A1-333444',
        fontFamily: 'Alegreya',
        fontUrl: 'https://fonts.googleapis.com/css?family=Alegreya',
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
    ],
    images: [
      {
        id: '123rdsffsdf',
        url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
      },
      {
        id: '1223435fsdf',
        url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Ciri_Cosplay_%28The_Witcher_3_Wild_Hunt%29_%E2%80%A2_2.jpg/1024px-Ciri_Cosplay_%28The_Witcher_3_Wild_Hunt%29_%E2%80%A2_2.jpg',
      },
      {
        id: '15677fsdf',
        url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/13-08-31-Kochtreffen-Wien-RalfR-N3S_7849-024.jpg/1280px-13-08-31-Kochtreffen-Wien-RalfR-N3S_7849-024.jpg',
      },
      {
        id: '189765df',
        url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/India_-_Varanasi_green_peas_-_2714.jpg/1280px-India_-_Varanasi_green_peas_-_2714.jpg',
      },
      {
        id: '5612324346df',
        url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sadhu_V%C3%A2r%C3%A2nas%C3%AE.jpg/1280px-Sadhu_V%C3%A2r%C3%A2nas%C3%AE.jpg',
      },
    ],
  },
  ui: {
    router: parseUrl(),
    editingColorId: '',
    editingTextNode: null,
    addingElement: null,
    draggingNode: null,
    addingAtom: null,
    hoveredCell: null,
    selectedCell: null,
    selectedNode: null,
    selectedNodeToOverride: null,
    expandingNode: null,
    stateManager: null,
    showAddComponentMenu: false,
    showExportMenu: false,
    showGrid: false,
  },
  // ...mergeSaved,
}

export default proxify(defaultState)
