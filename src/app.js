import React from 'react'
import { Provider } from 'react-redux'
import store from './redux/store'

import State from './components/state'
import Component from './components/component'
import Display from './components/display'

export default (props) =>
    <Provider store={store}>
        <div style={{height: '100%', display: 'flex', boxSizing: 'border-box'}}>
            <State/>
            <Component/>
            <Display/>
        </div>
    </Provider>