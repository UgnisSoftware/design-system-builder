import { proxify } from 'lape'
import {
  Alignment,
  ComponentView,
  FontSizeName,
  NodeTypes,
  ObjectFit,
  Overflow,
  RouterPaths,
  State,
  Units,
  ViewTypes,
} from '@src/interfaces'

const defaultState: State = {
  elements: {
    Button: {
      Primary: {
        id: 'rootId',
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
            padding: {
              top: '0px',
              left: '0px',
              bottom: '0px',
              right: '0px',
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
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
            text: 'Button',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
        ],
        background: {
          colorId: 'cccc-3333',
        },
        border: 'borbor-6666',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
      Secondary: {
        id: 'rootId',
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
            padding: {
              top: '0px',
              left: '0px',
              bottom: '0px',
              right: '0px',
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
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
            text: 'Button',
            fontSize: FontSizeName.S,
            focus: {},
            hover: {},
          },
        ],
        background: {
          colorId: 'cccc-3333',
        },
        border: 'borbor-6666',
        boxShadow: 'shadow-7777',
        focus: {},
        hover: {},
      },
    },
    Input: [
      {
        name: 'Default',
        root: {
          id: 'rootId',
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
              value: 80,
              unit: Units.Px,
            },
          ],
          children: [
            {
              id: '55a38774',
              type: NodeTypes.Text,
              position: {
                columnStart: 1,
                columnEnd: 2,
                rowStart: 1,
                rowEnd: 2,
              },
              padding: {
                top: '0px',
                left: '0px',
                bottom: '0px',
                right: '0px',
              },
              alignment: {
                horizontal: Alignment.center,
                vertical: Alignment.center,
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
              text: 'Button',
              fontSize: FontSizeName.S,
              focus: {},
              hover: {},
            },
          ],
          background: {
            colorId: 'cccc-3333',
          },
          border: 'borbor-6666',
          boxShadow: 'shadow-7777',
          focus: {},
          hover: {},
        },
      },
    ],
  },
  components: {
    'abcd-1234': {
      id: 'abcd-1234',
      name: 'Card',
      viewMode: ViewTypes.SingleCenter,
      root: {
        id: 'rootId',
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
            padding: {
              top: '0px',
              left: '0px',
              bottom: '0px',
              right: '0px',
            },
            alignment: {
              horizontal: Alignment.stretch,
              vertical: Alignment.stretch,
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
            children: [],
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
            padding: {
              top: '0px',
              left: '0px',
              bottom: '0px',
              right: '0px',
            },
            alignment: {
              horizontal: Alignment.center,
              vertical: Alignment.center,
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
            text: 'Nebula c51-b9',
            fontSize: FontSizeName.L,
            focus: {},
            hover: {},
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
  },
  pages: {
    'qwer-1234': {
      id: 'qwer-1234',
      name: 'Front Page',
      viewMode: ViewTypes.SingleCenter,
      root: {
        id: 'rootId',
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
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        rows: [
          {
            value: 100,
            unit: Units.Px,
          },
          {
            value: 100,
            unit: Units.Px,
          },
        ],
        children: [],
        background: {
          colorId: 'bbbb-2222',
        },
        focus: {},
        hover: {},
      },
    },
  },
  colors: [
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
      value: '6px 6px 2px 1px rgba(0, 0, 255, .2);',
    },
    {
      id: 'shadow-6666',
      value: 'inset 0 0 10px #4a4a4a',
    },
  ],
  border: [
    {
      id: 'borbor-6666',
      radius: '8px 8px 8px 8px',
      style: '2px solid #cacafd',
    },
    {
      id: 'barbar-7777',
      radius: '0px 149px 0px 51px',
      style: '',
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
    componentView: ComponentView.Center,
    editingTextNode: null,
    editingBoxNode: null,
    addingComponent: false,
    addingPage: false,
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
