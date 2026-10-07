# @fitzyracing/react-transition-group [![npm][npm-badge]][npm]

> Part of **[360 Bench](https://github.com/fitzyracing1/360-bench)**, tested fixes for abandoned npm packages.

> **This is a fork of [react-transition-group](https://github.com/reactjs/react-transition-group)
> by the [React Community](https://github.com/reactjs)** and its contributors, published as a
> drop-in replacement that works on React 19. The upstream package has not been released
> since v4.4.5 (August 2022), and the React 19 crash below is still open. All credit for the
> original library goes to its authors and contributors; it remains available under the same
> BSD-3-Clause license.


## What's fixed in this fork

Based on upstream `react-transition-group@4.4.5` (plus the documentation-only commits on
upstream `master` since then); the API is unchanged.

- **No more `TypeError: findDOMNode is not a function` on React 19.** React 19 removed
  `ReactDOM.findDOMNode`, which upstream uses to find the element to animate whenever you
  don't pass a `nodeRef`. So `<Transition>`, `<CSSTransition>`, and anything built on them
  (`<SwitchTransition>`, `<TransitionGroup>`, `<ReplaceTransition>`, and libraries such as
  react-bootstrap 1.x and Material-UI 4) crashed as soon as they rendered or animated. On React 19
  the fork now puts its own ref on the child element, combined with any `ref` the child
  already has, and reads the DOM node from it.
  Upstream issue: [#918](https://github.com/reactjs/react-transition-group/issues/918).
  The open upstream PR [#915](https://github.com/reactjs/react-transition-group/pull/915)
  only updates CI and tests; it does not fix the crash.
- **Nothing changes on React 16.6, 17 and 18.** Where `findDOMNode` still exists the fork keeps
  calling it exactly as 4.4.5 does. That also means React 18.3 still prints its
  "findDOMNode is deprecated" warning when you don't pass `nodeRef`
  ([#904](https://github.com/reactjs/react-transition-group/issues/904)); pass `nodeRef`
  to silence it, as upstream recommends.
- **Callbacks and timing are unchanged.** Without `nodeRef`, `onEnter`, `onEntering` and
  `onEntered` still receive `(node, isAppearing)`, `onExit`, `onExiting` and `onExited`
  receive `(node)`, and `addEndListener` receives `(node, done)`. With `nodeRef`, the node
  is still left out, as before. `CSSTransition` applies the same classes in the same order
  (`fade-enter`, `fade-enter fade-enter-active`, `fade-enter-done`, ...).

### On React 19, the child has to accept a `ref`

Without `nodeRef`, React 19 offers no way to find a component's DOM node except through a
`ref`. The child of a transition therefore has to be one of:

- a DOM element (`<div>`, `<li>`, ...),
- a `forwardRef` component, or
- a function component that passes its `ref` prop to a DOM element (in React 19 `ref` is
  an ordinary prop, so `(props) => <div {...props} />` works).

If the child is a function component that ignores `ref`, or a class component, the fork
cannot see the node. It does not crash: the transition still moves through
`entering` → `entered` (or `exiting` → `exited`) on its `timeout`, so render-prop children
that style themselves from the status keep working. However, the callbacks receive `null`
instead of the node, `addEndListener` is not called, and `CSSTransition` cannot add its
classes. In development the fork logs one warning per transition when this happens.
The fix is the same as upstream's advice: pass a `nodeRef`.

Other small differences, all React 19 only:

- If the child renders nothing (`null`), a transition with a `timeout` now waits for that
  timeout instead of finishing on the next tick, and the development warning above is logged.
- `findDOMNode` could find a node rendered through a portal; a ref only sees the element it is
  attached to.
- `<ReplaceTransition>`'s own `on*` callbacks receive the element that wraps the children
  (the `<TransitionGroup>` `<div>`, as with `findDOMNode`). With `component={null}` they receive
  the node of the child that is transitioning.


## Install

```bash
npm install @fitzyracing/react-transition-group
```

### Using it as a drop-in replacement

`react-transition-group` is often installed as a dependency of UI libraries (react-bootstrap,
Material-UI, reactstrap, ...). To make your whole dependency tree use this fork without
changing any code, add an override to your `package.json`:

```json
{
  "overrides": {
    "react-transition-group": "npm:@fitzyracing/react-transition-group@^4.4.6"
  }
}
```

(Yarn: use `"resolutions"`; pnpm: `"pnpm": { "overrides": { ... } }`. Very early npm 9
releases such as 9.2.0 reject aliased overrides with "Invalid comparator", so upgrade npm if
you see that.)

Or alias it directly in your own dependencies, so `import { CSSTransition } from 'react-transition-group'`
and `react-transition-group/CSSTransition` keep working:

```bash
npm install react-transition-group@npm:@fitzyracing/react-transition-group
```

TypeScript types still come from `@types/react-transition-group`, which applies unchanged
when you use the override or the alias.

### Tests

The upstream suite runs on React 18 (`npm run testonly`), and the same suite runs on React 16,
17 and 19 through `jest.compat.config.js` (`npm run test:compat:install`, then
`npm run test:react16`, `npm run test:react17`, `npm run test:react19`).
`test/without-nodeRef-test.js` covers transitions without `nodeRef`. All of its tests failed
on 4.4.5 under React 19 and pass on 4.4.5 under React 16, 17 and 18, so they pin down the
behaviour the fix keeps.

To build the package: `npm run build`, then `npm pack` inside `lib/` (`npm run pack:lib`).
Publish from `lib/`, never from the repository root.


## About react-transition-group


> **ATTENTION!** To address many issues that have come up over the years, the API in v2 and above is not backwards compatible with the original [`React addon (v1-stable)`](https://github.com/reactjs/react-transition-group/tree/v1-stable).
>
> **For a drop-in replacement for `react-addons-transition-group` and `react-addons-css-transition-group`, use the v1 release. Documentation and code for that release are available on the [`v1-stable`](https://github.com/reactjs/react-transition-group/tree/v1-stable) branch.**
>
> We are no longer updating the v1 codebase, please upgrade to the latest version when possible

A set of components for managing component states (including mounting and unmounting) over time, specifically designed with animation in mind.

## Documentation

- [**Main documentation**](https://reactcommunity.org/react-transition-group/)
- [Migration guide from v1](/Migration.md)

## TypeScript
TypeScript definitions are published via [**DefinitelyTyped**](https://github.com/DefinitelyTyped/DefinitelyTyped) and can be installed via the following command:

```
npm install @types/react-transition-group
```

## Examples

Clone the repo first:

```
git@github.com:fitzyracing1/react-transition-group.git
```

Then run `npm install` (or `yarn`), and finally `npm run storybook` to start a storybook instance that you can navigate to in your browser to see the examples.

## Security contact

To report a security vulnerability in this fork, please use
[GitHub private vulnerability reporting](https://github.com/fitzyracing1/react-transition-group/security/advisories/new)
rather than a public issue.

## License

[BSD-3-Clause](./LICENSE) - Copyright (c) 2018, React Community. The original license and
copyright notice are retained unchanged; fork changes are released under the same license.

Original project: https://github.com/reactjs/react-transition-group

[npm-badge]: https://img.shields.io/npm/v/@fitzyracing/react-transition-group.svg
[npm]: https://www.npmjs.com/package/@fitzyracing/react-transition-group
