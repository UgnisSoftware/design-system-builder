import lape from 'lape';
import { FontSizeName, RouterPaths, State } from '@src/interfaces';

const defaultState: State = {
  router: {
    path: RouterPaths.fonts,
  },
  components: {
    'abcd-1234': {
      name: 'Button',
      nodes: [],
    },
  },
  componentList: ['abcd-1234'],
  colors: [],
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
        lineHeight: '14px',
      },
      [FontSizeName.S]: {
        name: FontSizeName.S,
        fontSize: '12px',
        lineHeight: '14px',
      },
      [FontSizeName.M]: {
        name: FontSizeName.M,
        fontSize: '12px',
        lineHeight: '14px',
      },
      [FontSizeName.L]: {
        name: FontSizeName.L,
        fontSize: '12px',
        lineHeight: '14px',
      },
      [FontSizeName.XL]: {
        name: FontSizeName.XL,
        fontSize: '12px',
        lineHeight: '14px',
      },
    },
  },
};

export default lape(defaultState);
