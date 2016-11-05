import ugnis from './ugnis'
import devtools, {onlyDevtools} from './devtools'

// import devtoolsApp from '../ugnis_components/devtools.js'
// const app = ugnis(document.getElementById('app'), devtoolsApp)
// devtools(app)

const emptyApp = {
    nodes: {
        _rootNode: {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '_rootStyle',
            childrenIds: []
        }
    },
    styles: {
        _rootStyle: {
            padding: '10px',
            background: '#f5f5f5'
        }
    },
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

// onlyDevtools()