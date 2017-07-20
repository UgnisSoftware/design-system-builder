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
  - *Future proof* - writing Ugnis to \<insert a new framework name here\> transformer is trivial. As is updating to a new Ugnis version.

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


FAQ

What is Ugnis?

Ugnis is an web application builder that is as powerful as any other programming language but does not require writing a single line of code.

Why did you create Ugnis?

We wanted a way for domain experts to change their applications without going through the development team and for development team to be more productive. Ugnis guarantees no runtime errors so anyone on the team can change the application without fear or large time investment.

Is Ugnis powerful enough for any application?

Ugnis is written in Ugnis itself. We definitely believe that Ugnis is powerful enough for any application.

Ugnis will not scale.

First of all, this is not a question. Second, it was built to scale. Ugnis shows how your nodes, state and actions are connected without going through multiple files and hundreds of lines of code.

Is Ugnis slower than React/Elm/etc?

In the alpha we are not optimising for speed, still, Ugnis has much more knowledge about your application  can be optimised.

What about server, android/ios?

It’s on the roadmap, but we are working on the web applications right now

What is Ugnis Software?  We are a company working on AI based products. Our goal is to simplify complexity.

Can I now fire all my developers?

Not really, while we have reduced the boilerplate considerably and made the developing progress more understandable, the essential engineering part is still present in Ugnis. Though non-engineers now can easily check the progress and contribute parts of the software themselves.

Thank you:

Douglas Crockford, Nicholas C. Zakas, React team, Andrew Clark, Dan Abramov, RxJS team, André “Staltz” Medeiros, Alan Kay, Rich Hickey, Evan Czaplicki and Jonathan Blow