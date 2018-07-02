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
