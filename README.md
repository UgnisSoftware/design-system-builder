# <img height="64" src="https://cloud.githubusercontent.com/assets/5903616/20250447/5fe963c2-aa17-11e6-8648-bc1760fdaeb7.png" />Ugnis 0.0.26v

Ugnis is a visual application builder. It's like React + Redux without boilerplate.

Ugnis consist of three parts:
  - your application as a JSON file - virtual-dom + virtual-state (tm)
  - a render json to html function
  - Ugnis visual editor because you wouldn't want to write JSON by hand

Read technical implementation details TODO HERE *Ugnis is actually a small LISP-like language, just don't tell anyone that*

# Goals
Goals (must be reached before releasing 1.0v)
  - [x] zero configuration, Ugnis-only apps don't need webpack or babel
  - [ ] powerful enough to write any application, Ugnis editor is written with Ugnis itself
  - [x] plays nice with existing apps, can be introduced in small steps
  - [ ] speed - Ugnis knows how view nodes are connected with the state, so there is no actual need to use virtual dom
  - [ ] scalable for humans - large applications are easy to understand
  - [ ] scalable for machines - application splitting by default
  - [ ] server side rendering
  - [ ] type safety - no runtime errors
  - [ ] editor works well on mobile
  - [ ] allow easy extension of the runtime

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