# Ugnis 0.9.2v-alpha

Ugnis is a visual editor for designers and developers alike. [Try it online!](http://ugnis.com)

Exports to React and React-Native (experimental). Vote for more integrations [in this issue](https://github.com/UgnisSoftware/ugnis/issues/1)

Default components use Google Material Design.

![Ugnis Exporting to React and RN](https://user-images.githubusercontent.com/5903616/29389906-aed78aba-82f5-11e7-85bb-013a222c1990.gif)

## How to try it locally

Clone the repository, download node modules and compile:
```
git clone https://github.com/UgnisSoftware/ugnis && cd ugnis && npm install && npm run compile
```

Start the editor:
```
npm start
```

Now open [localhost:3000](http://localhost:3000)

**Warning**: Ugnis is still in alpha, [we are still missing some features](https://github.com/UgnisSoftware/ugnis/blob/master/ROADMAP.md)

## How Ugnis differs from other design tools?

Ugnis has a state that can be changed through events. This allows you to visually create dynamic components:

![Start Ugnis](https://user-images.githubusercontent.com/5903616/29389920-b8c12072-82f5-11e7-8e1c-ff0cac27147d.gif)

And edit them on the fly:

![Edit Events ](https://user-images.githubusercontent.com/5903616/29389918-b3e9bdd4-82f5-11e7-89b1-5ee7b036c724.gif)

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
