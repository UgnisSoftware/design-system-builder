import { render } from 'react-dom';
import * as React from 'react';
import state from '@state';

import Editor from './editor/Editor';
let node = document.getElementById('editor');

class Root extends React.Component {
    componentDidMount(){
        state.listen(() => this.forceUpdate());
        window.addEventListener('resize', () => this.forceUpdate(), false);
        window.addEventListener('orientationchange', () => this.forceUpdate(), false);
    }

    render() {
        return <Editor />
    }
}

if ((module as any).hot) {
    (module as any).hot.accept()
}

render(<Root />, node);
