import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import App from './app.js'

ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>,
    document.getElementById('app')
)

if (module.hot) {
    module.hot.accept('./app.js', ()=> {
        const NextApp = require('./app.js').default
        ReactDOM.render(
            <AppContainer>
                <NextApp />
            </AppContainer>,
            document.getElementById('app')
        )
    })
}
