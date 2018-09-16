import { render } from 'react-dom';
import * as React from 'react';
import { view } from 'react-easy-state/dist/es.es6.js';

import Editor from './editor/Editor';
let node = document.getElementById('editor');

class Root extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', () => this.forceUpdate(), false);
    window.addEventListener('orientationchange', () => this.forceUpdate(), false);
  }

  render() {
    console.log('hi')
    return <Editor />;
  }
}

if ((module as any).hot) {
  (module as any).hot.accept();
}

const WrappedRoot = view(Root);

render(<WrappedRoot />, node);
