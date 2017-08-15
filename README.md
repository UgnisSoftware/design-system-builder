# <img height="64" src="https://user-images.githubusercontent.com/5903616/29315843-00e7ea76-81ce-11e7-92be-13590a1298a0.png" />Ugnis 0.8.2v-alpha

Ugnis is a visual editor for designers and developers alike. [Try it online!](https://ugnis.com/editor)

Exports to React, React-Native. Vote for more integrations [in this issue](https://github.com/UgnisSoftware/ugnis/issues/1)

Default components use Google Material Design.

## How to try it locally

Clone the repository
```
git clone https://github.com/UgnisSoftware/ugnis && cd ugnis
```

Start the editor
```
npm start
```

Now open [localhost:4000](http://localhost:4000)

**Warning**: Ugnis is still in alpha, while the exported code will work, [we are still missing some features](https://github.com/UgnisSoftware/ugnis/blob/master/ROADMAP.md)

## How does Ugnis work internally?

Ugnis is declarative programming taken to the extreme. Because no one wants to write JSON by hand, we have created the visual editor - it manages the code generation, so you could focus on the design and logic.

Ugnis consists of three parts:

  - Declarative definition of your Component.
  - Visual editor that changes the definition.
  - Exporters for each supported framework that take the definition and generate code.

## License:

Exported components are under the license that your project is.

Editor and compilers are under AGPL. Other Licenses are available upon request.

## Contributors

[Karolis Masiulis](https://www.github.com/masiulis) | [Jonas Bernotas](https://github.com/Djonix) | [Justinas Petuchovas](https://github.com/jpetuchovas) | [Vytas Butkus](http://vytasbutkus.com/)

### Thank you:

Douglas Crockford, Alan Kay, Chris Granger, Rich Hickey, Evan Czaplicki, André “Staltz” Medeiros, Sebastian Markbåge and everyone who is pushing programming forward!