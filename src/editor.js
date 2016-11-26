import devtools from '../ugnis_components/editor.js'
import ugnis from './ugnis'

export default (app) => {
    // wrap the app component
    const wrapper = document.createElement('div');
    app.vdom.elm.parentNode.appendChild(wrapper);
    wrapper.appendChild(app.vdom.elm);
    
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const dev = ugnis(node, devtools, app.definition)
    
    wrapper.style.width = 'calc(100% - 350px)'
    wrapper.style.position = 'relative'
    wrapper.style.transition = '0.5s width'
    dev.addListener((eventName, data, event, previousState, currentState, mutations)=>{
        if(eventName === 'TOGGLE_OPEN_DEVTOOLS'){
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
            if(mutations.events){
                app.definition.events = mutations.events
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

export function onlyEditor(){
    
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const dev = ugnis(node, devtools, devtools)
    
    dev.addListener((eventName, data, event, previousState, currentState, mutations)=>{
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
        if(mutations.events){
            dev.definition.events = mutations.events
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