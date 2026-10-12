# Getting started

## Install

```
npm install @fitzyracing/react-transition-group
# or keep the old name:
npm install react-transition-group@npm:@fitzyracing/react-transition-group
```

On React 19 without `nodeRef`, the child must accept a `ref`. See the README.

## Usage

Same components as upstream: `Transition`, `CSSTransition`, `SwitchTransition`, `TransitionGroup`, `ReplaceTransition` (exported from `src/index.js`). Upstream's API docs are linked from the README.

## Develop and test

```
yarn
npm test                 # lint + jest
npm run test:compat:install && npm run test:all-react   # React 16/17/19 compat
```
