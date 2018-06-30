import { render } from 'react-dom';
import * as React from 'react';
import state from '@state';

import Editor from './editor/Editor';
let node = document.getElementById('editor');

function renderer() {
  render(<Editor />, node);
}

state.listen(renderer);

window.addEventListener('resize', renderer, false);
window.addEventListener('orientationchange', renderer, false);

if (module.hot) {
    module.hot.accept()
}