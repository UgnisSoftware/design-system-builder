## Definition v0.9.2

Ugnis aims is to be homoiconic - we try to use the same data types that will end up in the Ugnis state tab.

Types:
  - text
  - number
  - boolean
  - variant
  - table
  - reference to a table row (ref)
  - array

Table/ref/array might still change a lot
There are empty tables, because right now variants and arrays must be a single type.

## ref

Refs are a way to point to a part of the code, for example `{"ref": "vNodeBox", id: "_rootNode"}` is the same as `definition.vNodeBox._rootNode`.

Ugnis is not resolved top down like most other programming languages, but starts from a ref showed above. For example

```
// basic definition
{
    "vNodeBox": {
        "_rootNode": {
            "title": "New Component",
            "style": '',
            "parent": {},
            "children": [],
            "events": []
        }
    },
}

// Inside Ugnis interpreter resolve is called
resolve({"ref": "vNodeBox", id: "_rootNode"})

// returns a react component: <div></div>
```

The principal is pretty general and is just a dialect of LISP, here is a very small implementation:
```
// your "app" definition that just does 1 + (2 + 3)
const definition = {
    add: {
        a: {first: 1, second:{ref: 'add', id: 'b'}},
        b: {first: 2, second:3}
    }
}

// Super small interpreter example
const resolve = (ref)=> {
        if (ref.ref === undefined) {
            return ref
        }
        const def = definition[ref.ref][ref.id]

        if (ref.ref === 'add') {
            return resolve(def.first) + resolve(def.second)
        }
}

// start computation
resolve({ref: 'add', id: 'a'}) // returns 6
```

Compilers are very similar to the interpreter but instead of computing they return strings of code -
resolving in interpreter returns `6`, resolving in compiler - `"1 + 2 + 3"`. You can see, that smarter compilers would
optimize this code to remove the computation all together.

Ugnis has more than just "add" operation, but the principle is the same, the full definition is below.

## definition
```
{
    id: text
    version: text
    reactPath: text
    reactNativePath: text
    eventData: {
        [id]: {
            type: variant ["number", "text", "boolean"]
        }
    },
    toLowerCase: {
        [id]: {}
    },
    toUpperCase: {
        [id]: {}
    },
    equal: {
        [id]: {
            value: ref pipe
        }
    },
    and: {
        [id]: {
            value: ref pipe
        }
    },
    or: {
        [id]: {
            value: ref pipe
        }
    },
    not: {
        [id]: {}
    },
    length: {
        [id]: {}
    },
    split: {
         defaultValue: ref pipe
         branches: array of ref branch
    }
    branch: {
         test: ref pipe (boolean)
         value: ref pipe
    }
    pipe: {
        [id]: {
            type: variant ("number" || "text" || "boolean" || "table")
            value: text || number || boolean || ref table
            transformations: array of ref
        }
    },
    join: {
        [id]: {
            value: ref pipe
        }
    },
    add: {
        [id]: {
            value: ref pipe
        }
    },
    subtract: {
        [id]: {
            value: ref pipe
        }
    },
    multiply: {
        [id]: {
            value: ref pipe
        }
    },
    divide: {
        [id]: {
            value: ref pipe
        }
    },
    remainder: {
        [id]: {}
    },
    vNodeBox: {
        [id]: {
            title: text
            style: ref style
            parent: ref vNodeBox
            children: array of refs vNode...
            events: array of refs event
        }
    },
    vNodeText: {
        [id]: {
            title: text
            style: ref style
            parent: ref vNodeBox
            value: ref pipe
            events: array of refs event
        }
    },
    vNodeInput: {
        [id]: {
            title: text
            style: ref style
            parent: ref vNodeBox
            value: ref pipe
            events: array of refs event
        }
    },
    vNodeList: {
        [id]: {
            title: text
            parent: ref vNodeBox
            value: ref pipe
            children: array of refs vNode...
        }
    },
    vNodeIf: {
        [id]: {
            title: text
            parent: ref vNodeBox
            value: ref pipe
            children: array of refs vNode...
        }
    },
    vNodeImage: {
        [id]: {
            title: text
            style: ref style
            parent: ref vNodeBox
            src: ref pipe
            events: array of refs event
        }
    },
    style: {
        [id]: {
            flex: ref pipe
            display: ref pipe
            height: ref pipe
            width: ref pipe
            margin: ref pipe
            padding: ref pipe
            zIndex: ref pipe
            top: ref pipe
            bottom: ref pipe
            left: ref pipe
            right: ref pipe
            alignItems: ref pipe
            justifyContent: ref pipe
            flexDirection: ref pipe
            flexWrap: ref pipe
            border: ref pipe
            borderRadius: ref pipe
            background: ref pipe
            opacity: ref pipe
            overflow: ref pipe
            boxShadow: ref pipe
            cursor: ref pipe
            color: ref pipe
            fontFamily: ref pipe
            fontStyle: ref pipe
            fontSize: ref pipe
            fontWeight: ref pipe
            lineHeight: ref pipe
            textDecorationLine: ref pipe
            letterSpacing: ref pipe
            transition: ref pipe
            transform: ref pipe
        }
    },
    nameSpace: {
        [id]: {
            title: text
            children: array of ref state || ref table
        }
    },
    table: {
        [id]: {
            title: text
            type: variant ("table")
            defaultValue: array of table?!
            columns: array of ref state
            mutators: array of ref mutator
        }
    },
    push: {
        [id]: {
            row: row ref
        }
    },
    row: {
        [id]: {
            table: table ref
            columns: array of column refs
        }
    },
    column: {
        [id]: {
            state: state ref
            value: ref pipe or static if used by default
        }
    },
    state: {
        [id]: {
            title:
            ref: [id],
            type: variant ("text" || "number" || "boolean")
            defaultValue: text || number || boolean
            mutators: []
        },
    },
    mutator: {
        [id]: {
            event: ref event
            state: ref state
            mutation: ref pipe
        }
    },
    event: {
        [id}: {
            type: text variant ("input" || "click" || "dblclick" || "mousedown" || "mouseenter" || "mouseleave" || "mousemove" || "mouseout" || "mouseover" || "mouseup" || "focus" || "blur" || "change" || "submit" || "keydown" || "keyup")
            title: text,
            mutators: array of ref mutator
            emitter: ref vNode
        }
    }
}
```

Note:
  - eventData are repeated across all definitions, used for dragging and dropping data into events, code should stop using it and it should be removed
  - toUpperCase, toLowercase, not, length and remainder do nothing, references to them return empty objects, should be removed when code is ready
  - every node gets all the styles and all the according pipes, I would like to add styles only when necessary, but this requires a big change inside editors style panel
  - there can be only a single nameSpace right now (we used to allow grouping states, similar to view boxes, and this functionality might return)
  - table.type might not be used anywhere, needs checking
  - table.defaultValue is breaking the convention of normalized data for now
  - state has it's id repeated inside as ref, our code should stop using it and it should be removed
  - event type list might change