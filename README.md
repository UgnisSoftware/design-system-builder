# <img height="64" src="https://cloud.githubusercontent.com/assets/5903616/20250447/5fe963c2-aa17-11e6-8648-bc1760fdaeb7.png" />Ugnis 0.0.26v

Ugnis is a cross framework UI component library + visual editor. TODO download

Supports React, React-Native, Vue, Cycle.js, Angular 1/2+, Ember, Elm, Moon.

Default components use google material design.

# Why use Ugnis?

1.) Own your components - usually adapting external components is difficult, but visual editor makes it easy.
2.) Create a uniform component library for your company/project.
3.) Your components will work with any new JavaScript framework that comes out.

# Keyboard shortcuts

# How does Ugnis work?

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