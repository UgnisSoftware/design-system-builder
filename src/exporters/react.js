/*
React exporter:
import React from 'react';

class App extends Component {
  constructor(){
    super();
    this.state = {
        DEFAULT STATE
    }
  }

  EVENT() {
    setState
  }

  render() {
    return (
      <div style={STYLE} onClick={EVENT.bind(this)>
         COMPONENT TREE
      </div>
    );
  }
}

 */

function flatten(arr) {
    return arr.join(' ')
}

module.exports = (definition) => {


    function createDefaultState() {
        return Object.keys(definition.state).map(key=>definition.state[key]).reduce((acc, def)=> {
            acc[def.ref] = def.defaultValue
            return acc
        }, {})
    }

    const state = JSON.stringify(createDefaultState())

    function resolve(ref){
        // static value (string/number)
        if(ref.ref === undefined){
            return ref
        }
        const def = definition[ref.ref][ref.id]
        if (ref.ref === 'pipe') {
            return pipe(ref)
        }
        if (ref.ref === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else)
        }
        if (ref.ref === 'state') {
            return currentState[ref.id]
        }
        if (ref.ref === 'vNodeBox') {
            return boxNode(ref)
        }
        if (ref.ref === 'vNodeText') {
            return textNode(ref)
        }
        if (ref.ref === 'vNodeInput') {
            return inputNode(ref)
        }
        if (ref.ref === 'vNodeList') {
            return listNode(ref)
        }
        if (ref.ref === 'vNodeIf') {
            return ifNode(ref)
        }
        if (ref.ref === 'vNodeImage') {
            return imageNode(ref)
        }
        if (ref.ref === 'style') {
            return Object.keys(def).reduce((acc, val)=> {
                acc[val] = resolve(def[val])
                return acc
            }, {})
        }
        if (ref.ref === 'eventData') {
            return eventData[ref.id]
        }
        if (ref.ref === 'listValue') {
            return currentMapValue[def.list.id][def.property]
        }
        throw Error(ref)
    }
    
    function transformValue(value, transformations){
        for(let i = 0; i < transformations.length; i++) {
            const ref = transformations[i];
            const transformer = definition[ref.ref][ref.id]
            if (ref.ref === 'equal') {
                value = value === resolve(transformer.value)
            }
            if (ref.ref === 'add') {
                value = value + resolve(transformer.value)
            }
            if (ref.ref === 'subtract') {
                value = value - resolve(transformer.value)
            }
            if (ref.ref === 'multiply') {
                value = value * resolve(transformer.value)
            }
            if (ref.ref === 'divide') {
                value = value / resolve(transformer.value)
            }
            if (ref.ref === 'remainder') {
                value = value % resolve(transformer.value)
            }
            if (ref.ref === 'join') {
                value = value.toString().concat(resolve(transformer.value))
            }
            if (ref.ref === 'toUpperCase') {
                value = value.toUpperCase()
            }
            if (ref.ref === 'toLowerCase') {
                value = value.toLowerCase()
            }
            if (ref.ref === 'length') {
                value = value.length
            }
            if (ref.ref === 'and') {
                value = value && resolve(transformer.value)
            }
            if (ref.ref === 'or') {
                value = value || resolve(transformer.value)
            }
            if (ref.ref === 'not') {
                value = !value
            }
        }
        return value;
    }
    
    function pipe(ref) {
        return definition[ref.ref][ref.id].value

        //const def = definition[ref.ref][ref.id]
        //return transformValue(resolve(def.value), def.transformations)
    }
    
    const frozenShadow = 'inset 0 0 0 3px #53d486'
    
    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = JSON.stringify(resolve(node.style))
        // const events = '' +
        //         node.click ? `onClick={click-${node.click.ref}.bind(this)}` : '' +
        //         node.dblclick ? `onDoubleClick={dblclick-${node.dblclick.ref}.bind(this)}` : '' +
        //         node.mouseover ? `mouseOver={mouseover-${node.mouseover.ref}.bind(this)}` : '' +
        //         node.mouseout ? `mouseOut={mouseout-${node.mouseout.ref}.bind(this)}` : ''
        return `<div style={${style}} ${events}>${resolve(flatten(node.children.map(resolve)))}</div>`
    }
    
    function ifNode(ref) {
        const node = definition[ref.ref][ref.id]
        return resolve(node.value) ? node.children.map(resolve): []
    }
    
    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = JSON.stringify(resolve(node.style))
        return `<span style={${style}}>${resolve(node.value)}</span>`
    }
    
    function imageNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = JSON.stringify(resolve(node.style))

        return `<img style={${style}} src="${resolve(node.src)}" />`
    }
    
    function inputNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = JSON.stringify(resolve(node.style))

        return h('input', data)
    }
    
    function listNode(ref) {
        const node = definition[ref.ref][ref.id]
        const list = resolve(node.value)
        
        const children = Object.keys(list).map(key=>list[key]).map((value, index)=> {
            currentMapValue[ref.id] = value
            currentMapIndex[ref.id] = index
            
            return node.children.map(resolve)
        })
        delete currentMapValue[ref.id];
        delete currentMapIndex[ref.id];
        
        return children
    }

    const events = ''

    const components = resolve({ref:'vNodeBox', id:'_rootNode'})

    return `
    
import React from 'react'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
       
    }
  }
  
  ${events}

  render() {
    return (
      ${components}
    );
  }
}

export default App;
    `
}