import { lape } from 'lape'
import { Settings } from '@src/interfaces/settings'

const defaultState: Settings = {
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
        XS: {
          fontSize: '12px',
          lineHeight: '1.2em',
        },
        S: {
          fontSize: '16px',
          lineHeight: '1.2em',
        },
        M: {
          fontSize: '24px',
          lineHeight: '1.2em',
        },
        L: {
          fontSize: '38px',
          lineHeight: '1.2em',
        },
        XL: {
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
        XS: {
          fontSize: '12px',
          lineHeight: '1.2em',
        },
        S: {
          fontSize: '16px',
          lineHeight: '1.2em',
        },
        M: {
          fontSize: '24px',
          lineHeight: '1.2em',
        },
        L: {
          fontSize: '38px',
          lineHeight: '1.2em',
        },
        XL: {
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
}

export default lape(defaultState)
