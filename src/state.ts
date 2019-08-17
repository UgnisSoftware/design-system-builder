import { proxify } from 'lape'
import { State } from '@src/interfaces/state'
import { FontSizeName } from '@src/interfaces/settings'
import { Alignment, IconTypes, NodeTypes, ObjectFit, Units } from '@src/interfaces/nodes'
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
            fontSize: FontSizeName.S,
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
            fontSize: FontSizeName.S,
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
              fontSize: FontSizeName.M,
              iconType: IconTypes.check,
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
              fontSize: FontSizeName.M,
              iconType: IconTypes.check,
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
            iconType: IconTypes.menu,
            fontColorId: 'white-6666',
            fontSize: FontSizeName.M,
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
            fontSize: FontSizeName.M,
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
            fontSize: FontSizeName.S,
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
            fontSize: FontSizeName.L,
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
      {
        id: 'cccc-3333-3',
        name: 'Light grey',
        hex: '#d8d8d8',
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
        id: 'borbor-5555',
        radius: '8px',
        style: 'none',
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
    zoom: 100,
  },
  // ...mergeSaved,
}

export default proxify(defaultState)
