# Contributing

This fork only takes fixes for confirmed upstream bugs, and each fix needs a test that fails on the original (see the 360 Bench rules). Behaviour should stay the same as upstream wherever upstream did not crash. Before you open a PR, run:

```
yarn
npm test                 # lint + jest
npm run test:compat:install && npm run test:all-react   # React 16/17/19 compat
```

If upstream ships the fix itself, the fork will point people back to upstream.
