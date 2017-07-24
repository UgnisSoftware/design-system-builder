# <img height="64" src="https://github.com/masiulis/ugnis/blob/dev/static_prod/images/logo_new256x256.png?raw=true" />Ugnis 0.8.2v-alpha

Ugnis is a cross framework UI component library + visual editor. [Try it online!](https://ugnis.com/editor)

Supports React, React-Native, Vue, Cycle.js and pure JS. Vote for more integrations in this issue // TODO Angular 1/2+, Ember, Elm, Moon, etc

Default components use google material design.

## How to use it

Download ugnis locally:

```
npm install ugnis --save-dev
```

It will install Ugnis editor and download default Ugnis components

Next step is to start the editor

```
node ./node-modules/.bin/ugnis --port 4000 --source './ugnis_components'
```

Now open [localhost:4000](http://localhost:4000)

## Why use Ugnis?

  - Create a uniform component library for your company/project.
  - Default components can easily be modified to fit your needs by anyone on the team.
  - Works across frameworks. Perfect when migrating to a new framework.
  - **Future proof** - writing Ugnis to \<insert a new framework name here\> transformer is trivial. Updating to a new Ugnis version is automatic.

**Warning**: Ugnis is still in alpha, while we guarantee that exported code will work, [we are still missing some features](https://github.com/UgnisSoftware/ugnis/#goals-for-10v-release)

## Why have we created Ugnis?

Ugnis is a moonshot - a dream that we can create UI without

## How does Ugnis work internally?

Ugnis is declarative programming taken to the extreme. It's so declarative that reading and writing Ugnis components by hand is painful.
That's why the visual editor exists - it manages the code generation, so you could focus on design and logic.

Ugnis consists of three parts:

  - Declarative definition of your Component.
  - Visual editor that changes the definition.
  - Exporters for each supported framework that take the definition and generate code.

## Goals for 1.0v release

  - [x] Zero configuration, Ugnis-only components don't need webpack or babel
  - [ ] Integrates well with existing frameworks
  - [ ] View components:
    - [x] Box (also know as div/view)
    - [x] Text
    - [x] Image
    - [x] Input
  - [ ] Logic components:
    - [x] If
    - [ ] When (also know as if/else)
    - [ ] List
    - [ ] Recursion
  - [ ] State:
    - [x] Text (also known as string)
    - [x] Number
    - [x] Boolean
    - [x] Table
    - [ ] variants, boolean becomes a variant
    - [ ] connected tables - graphs
    - [ ] Date
  - [ ] Implements every Material Design component:
  - [x] type safety - does not allow runtime errors
  - [ ] Editor keyboard shortcuts are rebindable
  - [ ] Timers
  - [ ] Keyboard events

## Future improvements
  - [ ] Powerful enough to write any application, Ugnis editor is written with Ugnis itself
  - [ ] Hosted version - allow multiple people to work on the same component
  - [ ] Router
  - [ ] Fetch (also known as AJAX)
  - [ ] View components:
    - [ ] Icon
    - [ ] Link
  - [ ] ARIA
  - [ ] editor as a desktop app
  - [ ] server side rendering
  - [ ] application splitting
  - [ ] WebAssembly compiler
  - [ ] editor works well on mobile

## License:

MIT

## Contributors

[Karolis Masiulis](https://www.github.com/masiulis)

[Jonas Bernotas](https://github.com/Djonix)

[Justinas Petuchovas](https://github.com/jpetuchovas)

[Vytas Butkus](http://vytasbutkus.com/)

### Thank you:

Douglas Crockford, Nicholas C. Zakas, React team, Andrew Clark, Dan Abramov, RxJS team, André “Staltz” Medeiros, Alan Kay, Chris Granger, Rich Hickey, Evan Czaplicki, Jonathan Blow and everyone who is pushing programming forward!