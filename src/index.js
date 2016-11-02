import ugnis from './ugnis'
import devtools from './devtools'

// import devtoolsApp from '../ugnis_components/devtools.js'
// const app = ugnis(document.getElementById('app'), devtoolsApp)

const emptyApp = {
    nodes: {
        _rootNode: {
            _type: 'vNode',
            nodeType: 'box',
            childrenIds: []
        }
    },
    styles: {},
    state: {
        _rootState: {
            title: 'root state',
            stateType: 'nameSpace',
            childrenIds: [],
        },
    },
    mutators: {},
    actions: {},
}
const app = ugnis(document.getElementById('app'), emptyApp)
devtools(app)