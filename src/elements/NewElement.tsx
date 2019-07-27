import { Element, ElementType } from '@src/interfaces/elements'
import { uuid } from '@src/utils'

export default (name): Element => {
  const newId = uuid()
  return {
    id: newId,
    name: name,
    type: ElementType.New,
    root: null,
    modifiers: {},
  }
}
