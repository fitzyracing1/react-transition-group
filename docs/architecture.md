# Architecture

| Path | Role |
|---|---|
| `src/Transition.js` | core state machine |
| `src/CSSTransition.js` | class-name based transitions |
| `src/SwitchTransition.js, TransitionGroup.js, ReplaceTransition.js` | composite components |
| `src/utils/findDOMNode.js` | React-version-aware DOM node lookup (the fork's fix) |
| `rollup.config.js, scripts/write-lib-package.js` | build to lib/ |
| `test/` | jest tests including compat suites |


