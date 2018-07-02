import lape from 'lape';
import { FontSizeName, RouterPaths, State } from '@src/interfaces';

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
  spacing: [
    {
      name: 'S',
      size: 4,
    },
  ],
  font: {
    fontName: 'Roboto',
    fontUrl: 'https://fonts.googleapis.com/css?family=Roboto',
    sizes: {
      [FontSizeName.XS]: {
        name: FontSizeName.XS,
        fontSize: '12px',
        lineHeight: '1.2em',
      },
      [FontSizeName.S]: {
        name: FontSizeName.S,
        fontSize: '16px',
        lineHeight: '1.2em',
      },
      [FontSizeName.M]: {
        name: FontSizeName.M,
        fontSize: '24px',
        lineHeight: '1.2em',
      },
      [FontSizeName.L]: {
        name: FontSizeName.L,
        fontSize: '38px',
        lineHeight: '1.2em',
      },
      [FontSizeName.XL]: {
        name: FontSizeName.XL,
        fontSize: '50px',
        lineHeight: '1.2em',
      },
    },
  },
};

export default lape(defaultState);
