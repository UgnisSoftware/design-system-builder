import * as React from 'react'

import { ElementNode, Nodes, NodeTypes } from '@src/interfaces/nodes'
import stateComponents from '@state/components'

import Element from './_Element'
import BoxAtom from './Box'
import InputAtom from './Input'
import TextAtom from './Text'
import IconAtom from './Icon'

// element -> root node ->                       text node
//                                               ^       ^
//                                              /         \
//                            onDrag - change position  onclick - change style

// const element = {
//   id: 'button',
//   name: 'button',
//   root: {
//     id: 'root',
//     type: 'root',
//     children: [
//       {
//         type: 'box',
//         id: 'background',
//       },
//       {
//         type: 'text',
//         id: 'buttonText',
//         text: 'hello',
//       },
//     ],
//   },
// }

// component -> root node ->                    element node           -> element -> root node -> text node
//                                               ^       ^
//                                              /         \
//                            onDrag - change position  onclick - add override

// const component = {
//   id: 'AppBar',
//   name: 'App bar test',
//   root: {
//     type: 'root',
//     children: [
//       {
//         id: '123213',
//         type: 'element',
//         elementType: 'button'
//         elementId: 'button-id', // Changing ElementId removes overrides
//         overrides: {
//           // overrides exposed by elements are also overrides exposed by component
//           buttonText: { text: 'goodbye' }, // <- find by id and merge
//         },
//       },
//       {
//         id: '543523412',
//         type: 'element',
//         elementId: 'button',
//         overrides: {
//           // overrides exposed by elements are also overrides exposed by component
//           buttonText: { text: 'goodbye2' }, // <- find by id and merge
//         },
//       },
//       {
//         id: '3232323',
//         type: 'text',
//         text: 'componentText',
//       },
//     ],
//   },
// }

// page -> rootNode ->                          componentNode          -> component -> root node -> element node -> element -> root node -> text node
//                                               ^       ^
//                                              /         \
//                            onDrag - change position  onclick - add override

// const Page = {
//   id: 'Page',
//   name: 'Page page',
//   root: {
//     type: 'root',
//     children: [
//       {
//         type: 'component',
//         id: 'AppBar',
//         overrides: {
//           3232323: { text: 'goodbye' }, // <- find by id and merge
//           123213: { overrides: { text: 'goodbye' } }, // <- find by id, if no id, look for elements and merge
//           1232132: {
//             buttonText: { text: 'goodbye' },
//           }, // <- find by id, if no id, look for elements and merge
//         },
//       },
//       {
//         type: 'element',
//         id: 'button',
//         overrides: {
//           buttonText: { text: 'cancel' }, // <- find by id and merge
//         },
//       },
//       {
//         type: 'text',
//         text: 'componentText',
//       },
//     ],
//   },
// }

interface Props {
  component: Nodes
  tilted?: boolean
  index?: number
  parent: ElementNode | null
}

function Atoms({ component, parent, tilted, index }: Props) {
  if (component.type === NodeTypes.Element) {
    const element = {
      ...stateComponents.find((el) => el.id === component.elementId).root,
      columnStart: component.columnStart,
      columnEnd: component.columnEnd,
      rowStart: component.rowStart,
      rowEnd: component.rowEnd,
    }
    return <Element component={element} parent={component} tilted={tilted} index={index} />
  }
  if (component.type === NodeTypes.Box) {
    return <BoxAtom component={component} parent={parent} tilted={tilted} index={index} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextAtom component={component} parent={parent} tilted={tilted} index={index} />
  }
  if (component.type === NodeTypes.Input) {
    return <InputAtom component={component} parent={parent} tilted={tilted} index={index} />
  }
  if (component.type === NodeTypes.Icon) {
    return <IconAtom component={component} parent={parent} tilted={tilted} index={index} />
  }
}

export default Atoms
