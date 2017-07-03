# <img height="64" src="https://cloud.githubusercontent.com/assets/5903616/20250447/5fe963c2-aa17-11e6-8648-bc1760fdaeb7.png" />Ugnis 0.0.26v

Ugnis is a cross framework UI component library + visual editor. TODO download

Supports React, React-Native, Vue, Cycle.js and pure JS. Vote for more integrations in this issue // TODO Angular 1/2+, Ember, Elm, Moon, etc

Default components use google material design.

# How to use it

// TODO

# Why use Ugnis?

  - Works across frameworks. Useful when migrating to a new framework.
  - Create a uniform component library for your company/project.
  - Adapt components to fit your needs with the visual editor.
  - *Future proof* - writing Ugnis to <insert a new framework name here> transformer is trivial. As is updating to a new Ugnis version.

# Why have we created Ugnis


# Keyboard shortcuts

// TODO

# How does Ugnis work internally?

Ugnis is declarative programming taken to the extreme. It's so declarative that writing Ugnis components by hand is almost impossible.
That's why the visual editor is needed - it manages the writing part for you.

Ugnis consists of three parts:

  - Declarative definition of your Component.
  - Visual editor that changes the definition.
  - Exporters for each supported framework that take the definition and generate code.

# How to use it

To create your first component use the online editor TODO LINK or download the editor TODO LINK

if you don't want to download a packaged desktop app, you can use a website version via npm:
```bash
npm install ugnis-editor

node node_modules/.bin/ugnis-editor PORT=3000 PATH=./ugnis_modules #defaults
```

Once you create a component you can add it to your website, you have to import a runtime
TODO CDN

or through npm:
```bash
npm install ugnis
```

and mounting a component:
```javascript
import ugnis from 'ugnis'

const app = ugnis(htmlNode, json, defaultState)
```

If you are integrating Ugnis into an existing app, you can interact by sending and listening to events:
```javascript
app.emitEvent(eventName, data, nativeEvent)

app.addListener((eventName, data, nativeEvent, previousState, currentState, mutations)=>{ /*your code* /})
```

## Integrating with react
For react projects there is a special wrapper component
```bash
npm install ugnis-react # you don't need to npm install ugnis
```

```javascript
import React from 'react'
import Ugnis from 'ugnis-react'

const component = (props) =>
  <Ugnis
      definition={json}
      defaultState={defaultState}
      onMount={function(definition, vdom, currentState, render, emitEvent, addListener){}} />
```

#Community:
TODO Reddit

#License:

MIT