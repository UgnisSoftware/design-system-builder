# Guidelines for ugnis-modules

## General

- Module is a small, self-contained code piece.
- Modules are created in public. Everyone is free to comment, suggest changes and contribute.
- Modules above v1.0 are production ready, modules with v0.x are still in development

## README

Module README must have:

1. **Type** - Function / Class / Singleton / Library / Framework / Plugin
2. **Dependencies** - None / other npm module / browser / node.js
3. **Supported browsers**
4. **Language used** - ES6 / ES5 / TypeScript / JSX
5. **How To start using the module** - download / test / contribute
6. **License**

## Code quality

- Unit testable code must have 100% test coverage
- Module must be small and do one thing only.
- Additional functionality must be separated into a plugin module
- Module cannot change global state
- Module must work with ES6/browserify/io.js module patterns
- Module must be well documented, every available functionality must be explained and have at least one example
