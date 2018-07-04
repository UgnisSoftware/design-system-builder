import lape from 'lape';
import { FontSizeName, RouterPaths, SpacingSizeName, State } from '@src/interfaces';

const defaultState: State = {
  router: {
    path: RouterPaths.fonts,
    componentId: undefined,
  },
  components: {
    'abcd-1234': {
      name: 'Button',
      nodes: [],
    },
  },
  componentList: ['abcd-1234'],
  colors: {
    'vava-1823': '#f78888',
    'blas-9999': '#f3d250',
    'hhhh-1000': '#ececec',
    'aaaa-9994': '#90ccf4',
    'bbbb-9949': '#5da2d5',
  },
  editingColorId: '',
  spacing: {
    [SpacingSizeName.XS]: '2px',
    [SpacingSizeName.S]: '4px',
    [SpacingSizeName.M]: '8px',
    [SpacingSizeName.L]: '14px',
    [SpacingSizeName.XL]: '28px',
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
