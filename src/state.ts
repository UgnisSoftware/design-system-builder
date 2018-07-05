import lape from 'lape';
import { FontSizeName, RouterPaths, SpacingSizeName, State, NodeTypes } from '@src/interfaces';

const defaultState: State = {
  router: {
    path: RouterPaths.fonts,
    componentId: undefined,
  },
  components: {
    'abcd-1234': {
      name: 'Button',
      root: {
        type: NodeTypes.Root,
        width: 254,
        height: 254,
        nodes: []
      },
    },
  },
  componentList: ['abcd-1234'],
  colors: {
    'vava-1823': {
      name: 'Pink',
      hex: '#f78888',
    },
    'blas-9999': {
      name: 'Yellow',
      hex: '#f3d250',
    },
    'hhhh-1000': {
      name: 'Light grey',
      hex: '#ececec',
    },
    'aaaa-9994': {
      name: 'Light blue',
      hex: '#90ccf4',
    },
    'bbbb-9949': {
      name: 'Blue',
      hex: '#5da2d5',
    },
  },
  editingColorId: '',
  spacing: {
    [SpacingSizeName.XS]: '8px',
    [SpacingSizeName.S]: '16px',
    [SpacingSizeName.M]: '24px',
    [SpacingSizeName.L]: '48px',
    [SpacingSizeName.XL]: '64px',
  },
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
};

export default lape(defaultState);
