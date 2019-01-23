import { proxify } from 'lape'
import { FontSizeName, RouterPaths, State, NodeTypes, ViewTypes, ComponentView, Units } from '@src/interfaces'

const defaultState: State = {
  router: {
    path: RouterPaths.component,
    componentId: 'abcd-1234',
  },
  elements: {
    Button: [
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
          columns: [
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
          ],
          children: [],
          background: {
            colorId: 'eeee-5555',
          },
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
          colorId: 'aaaa-1111',
        },
        border: 'borbor-6666',
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
      hex: '#ececec',
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
      value: '0 10px 20px hsla(0, 0%, 0%,.15), 0 3px 6px hsla(0, 0%, 0%, .10);',
    },
  ],
  border: [
    {
      id: 'borbor-6666',
      radius: '80px 149px 80px 51px',
      style: '2px solid #5da2d5',
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
    editingColorId: '',
    componentView: ComponentView.Center,
    editingTextNode: null,
    addingComponent: false,
    addingPage: false,
    showAddComponentMenu: false,
    addingAtom: null,
    hoveredCell: null,
    selectedNode: null,
    zoom: 100,
  },
}

export default proxify(defaultState)
