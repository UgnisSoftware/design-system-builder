import lape from 'lape';
import { FontSizeName } from './interfaces';

interface Router {
  path: 'default' | 'fonts' | 'colors' | 'component';
  componentId?: string;
}

interface Node {
  type: 'box' | 'text' | 'input' | 'image' | 'component';
}

interface Component {
  name: string;
  nodes: Node[];
}

interface Color {
  name: string;
  hexValue: string;
}

interface Spacing {
  name: string;
  size: number;
}

interface FontSize {
  name: string;
  fontSize: string;
  lineHeight: string;
}

interface Font {
  fontName: string;
  fontUrl: string;
  sizes: { [size in FontSizeName]: FontSize };
}

interface State {
  router: Router;
  components: { [id: string]: Component };
  colors: Color[];
  spacing: Spacing[];
  font: Font;
}

const defaultState: State = {
  router: {
    path: 'default',
  },
  components: {
    id: {
      name: '',
      nodes: [],
    },
  },
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
