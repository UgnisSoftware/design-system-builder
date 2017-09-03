/*
 Ugnis React Native Compiler
 Copyright (C) 2017  Karolis Masiulis

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
      <View style={STYLE} onClick={EVENT.bind(this)>
         COMPONENT TREE
      </View>
    );
  }
}

 */

function flatten(arr) {
    return arr.join('\n            ')
}

const defaultStylesToRemove = {
    //alignItems: 'flex-start',
    //justifyContent: 'flex-start',
    height: '',
    width: '',
    maxWidth: '',
    minWidth: '',
    margin: '',
    padding: '',
    zIndex: '',
    top: '',
    bottom: '',
    left: '',
    right: '',
    border: '',
    borderRadius: '',
    opacity: '',
    boxShadow: '',
    cursor: '',
    transition: '',
    letterSpacing: '',
    lineHeight: '',
    flexWrap: 'wrap',
    background: 'none',
    overflow: 'visible',
    color: '#000000',
    fontFamily: 'inherit',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textDecorationLine: 'none',
}

let color = '#00BCD4' //'#FFC107'

module.exports = definition => {
    let styles = {}

    function resolve(ref) {
        // static value (string/number)
        if (ref === undefined) {
            return
        }
        if (ref.ref === undefined) {
            return ref.toString()
        }
        const def = definition[ref.ref][ref.id]
        if (ref.ref === 'pipe') {
            return pipe(ref)
        }
        if (ref.ref === 'conditional') {
            return `${resolve(def.predicate)} ? ${resolve(def.then)} : ${resolve(def.else)}`
        }
        if (ref.ref === 'state') {
            return `this.state['${ref.id}']`
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
            return Object.keys(def).reduce((acc, val) => {
                acc[val] = resolve(def[val])
                return acc
            }, {})
        }
        throw Error(ref)
    }

    function transformValue(value, transformations) {
        for (let i = 0; i < transformations.length; i++) {
            const ref = transformations[i]
            const transformer = definition[ref.ref][ref.id]
            if (ref.ref === 'equal') {
                value = value.concat(` === ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'add') {
                value = value.concat(` + ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'subtract') {
                value = value.concat(` - ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'multiply') {
                value = value.concat(` * ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'divide') {
                value = value.concat(` / ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'remainder') {
                value = value.concat(` % ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'join') {
                // optimise empty joins
                const join = resolve(transformer.value)
                if (value === '') {
                    value = join
                } else if (join === '') {
                } else {
                    value = '(' + value.concat(`).concat(${resolve(transformer.value)})`)
                }
            }
            if (ref.ref === 'toUpperCase') {
                value = value.concat(`.toUpperCase()`)
            }
            if (ref.ref === 'toLowerCase') {
                value = value.concat(`.toLowerCase()`)
            }
            if (ref.ref === 'length') {
                value = '(' + value.concat(`).lenght`)
            }
            if (ref.ref === 'and') {
                value = '(' + value.concat(`) && ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'or') {
                value = '(' + value.concat(`) || ${resolve(transformer.value)}`)
            }
            if (ref.ref === 'not') {
                value = '!' + value
            }
        }
        return transformations.length ? `{${value}}` : value
    }

    function pipe(ref) {
        const def = definition[ref.ref][ref.id]
        return transformValue(resolve(def.value), def.transformations)
    }

    function generateEvents(ref) {
        const node = definition[ref.ref][ref.id]
        return '' // TODO
        return node.events.reduce((acc, eventRef) => {
            const event = definition[eventRef.ref][eventRef.id]
            acc[event.type] = [emitEvent, eventRef]
            return acc
        }, {})
    }

    function generateStyles(ref) {
        const node = definition[ref.ref][ref.id]
        let style = resolve(node.style)
        Object.keys(defaultStylesToRemove).forEach(key => {
            if (defaultStylesToRemove[key] === style[key]) {
                delete style[key]
            }
        })
        styles[ref.id] = style
        return `style={styles["${ref.id}"]}`
    }

    function generateAttrs(ref) {
        const node = definition[ref.ref][ref.id]
        const attrs = {
            src: resolve(node.src),
            className: resolve(node['class']),
            id: resolve(node.id),
        }
        return Object.keys(attrs).reduce((acc, key) => {
            if (attrs[key]) {
                acc = acc.concat(` ${key}="${attrs[key]}"`)
            }
            return acc
        }, '')
    }

    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        return `
        <View ${generateStyles(ref)} ${generateAttrs(ref)} ${generateEvents(ref)} >
            ${resolve(flatten(node.children.map(resolve)))}
        </View>`
    }

    function ifNode(ref) {
        const node = definition[ref.ref][ref.id]
        return `${resolve(node.value)} ? ${node.children.map(resolve)} : ''`
    }

    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        return `<Text ${generateStyles(ref)} ${generateAttrs(ref)} ${generateEvents(ref)} >
            ${resolve(node.value)}
        </Text>`
    }

    function imageNode(ref) {
        const node = definition[ref.ref][ref.id]

        return `<Image ${generateStyles(ref)} ${generateAttrs(ref)} ${generateEvents(ref)} source={require(".${resolve(node.src)}")} />`
    }

    function inputNode(ref) {
        const node = definition[ref.ref][ref.id]

        return `<TextInput ${generateStyles(ref)} ${generateAttrs(ref)} ${generateEvents(ref)} value="${resolve(node.value)}" />`
    }

    function listNode(ref) {
        const node = definition[ref.ref][ref.id]
        const list = resolve(node.value)

        const children = Object.keys(list)
            .map(key => list[key])
            .map((value, index) => {
                currentMapValue[ref.id] = value
                currentMapIndex[ref.id] = index

                return node.children.map(resolve)
            })
        delete currentMapValue[ref.id]
        delete currentMapIndex[ref.id]

        return children
    }

    const events = ''

    const components = resolve({ ref: 'vNodeBox', id: '_rootNode' })

    const cleaneUpStyle = Object.keys(styles).reduce((acc, id) => {
        const fixedStyle = Object.keys(styles[id]).reduce((acc, style) => {
            if (style === 'background') {
                acc['backgroundColor'] = styles[id]['background']
                return acc
            }
            if (
                styles[id][style] === '' ||
                styles[id][style] === 'none' ||
                style === 'boxShadow' ||
                style === 'cursor' ||
                style === 'fontFamily'
            ) {
                return acc
            }
            if (style === 'fontWeight') {
                acc[style] = styles[id][style]
                return acc
            }
            if (style === 'flex') {
                acc[style] = parseInt(styles[id][style][0])
                return acc
            }
            acc[style] = parseInt(styles[id][style])
                ? parseInt(styles[id][style])
                : parseInt(styles[id][style].slice(0, -2)) ? parseInt(styles[id][style].slice(0, -2)) : styles[id][style]
            return acc
        }, {})
        acc[id] = fixedStyle
        return acc
    }, {})

    function createDefaultState() {
        return definition.nameSpace['_rootNameSpace'].children.reduce((acc, ref) => {
            const def = definition[ref.ref][ref.id]
            acc[ref.id] = def.defaultValue
            return acc
        }, {})
    }

    const state = JSON.stringify(createDefaultState(), undefined, 4)

    return `import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'

class App extends React.Component {
  constructor(){
    super();
    this.state = ${state}
  }
  ${events}
  render() {
    return (${components}
    );
  }
}

const styles = StyleSheet.create(
    ${JSON.stringify(cleaneUpStyle, undefined, 4)}
);

export default App;
    `
}
