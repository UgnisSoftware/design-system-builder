import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

const finalCreateStore = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f=> f
)(createStore)

const store = finalCreateStore(rootReducer)

if (module.hot) {
    module.hot.accept('./reducers', ()=>
        store.replaceReducer(require('./reducers/index').default)
    )
}

export default store

