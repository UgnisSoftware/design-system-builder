import devtools from '../ugnis_components/devtools.js'
import ugnis from './ugnis'

export default (app) => {
    // wrap the app component
    var wrapper = document.createElement('div');
    app.vdom.elm.parentNode.appendChild(wrapper);
    wrapper.appendChild(app.vdom.elm);
    
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const dev = ugnis(node, devtools, app.definition)
    
    wrapper.style.width = 'calc(100% - 350px)'
    wrapper.style.position = 'relative'
    wrapper.style.transition = '0.5s width'
    dev.addListener((actionName, data, e, currentState, mutations)=>{
        if(actionName === 'TOGGLE_OPEN_DEVTOOLS'){
            if(wrapper.style.width === '100%'){
                wrapper.style.width = 'calc(100% - 350px)'
            }
            else {
                wrapper.style.width = '100%'
            }
        } else {
            if(mutations.nodes){
                app.definition.nodes = mutations.nodes
            }
            if(mutations.styles){
                app.definition.styles = mutations.styles
            }
            if(mutations.state){
                app.definition.state = mutations.state
            }
            if(mutations.mutations){
                app.definition.mutations = mutations.mutations
            }
            if(mutations.actions){
                app.definition.actions = mutations.actions
            }
            app.render()
        }
    })
    
    document.addEventListener('keydown', (e)=>{
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(app.definition), headers: {"Content-Type": "application/json"}})
            return false;
        }
    })
};

export function onlyDevtools(){
    
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const dev = ugnis(node, devtools, devtools)
    
    dev.addListener((actionName, data, e, currentState, mutations)=>{
        if(mutations.nodes){
            dev.definition.nodes = mutations.nodes
        }
        if(mutations.styles){
            dev.definition.styles = mutations.styles
        }
        if(mutations.state){
            dev.definition.state = mutations.state
        }
        if(mutations.mutations){
            dev.definition.mutations = mutations.mutations
        }
        if(mutations.actions){
            dev.definition.actions = mutations.actions
        }
    })
    
    document.addEventListener('keydown', (e)=>{
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(devtools), headers: {"Content-Type": "application/json"}})
            return false;
        }
    })
}