# Changelog

## [4.1.0]

- Added `SsrScope` to give unique ids to components rendered several times (lists)
- Fixed `useSsrEffect` being called again on the first re-render after hydration
- `ExcludeSsr` no longer causes a hydration mismatch: children are rendered after mount
- `ExcludeSsr` renders multiple and text children on the client
- Fixed functional updates in `useSsrState` (`setState(prev => ...)` received `undefined` when the state was not restored from the server)
- `useRegisterEffect` waits for any thenable, not only native `Promise`
- Babel plugin: stable ids when a file is transformed again (watch mode, HMR)
- Babel plugin: inject the `useSsrEffect` id for any callback expression and for non-literal deps
- Babel plugin: removed `md5` dependency
- Minor refactoring of `serverRender`
- Fixed the ESM build (`lib/esm`): the `IInitState` type was imported as a value
- Published packages contain only the build output (no tests, sources and configs)
- Tests for the babel plugin, test coverage is 100% with a 90% threshold

## [4.0.0]

- React-Compiler support

## [3.0.0]

- React 19 support

## [2.3.0]

- Refactoring
- Fixed a few typescript issues
- Updated styleguide and build system
- Dropped old examples

## [2.0.0]

- React 18 support
- The new approach to handle asynchronous actions
- A few fixes
