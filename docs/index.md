# @fitzyracing/react-transition-group

`@fitzyracing/react-transition-group` is a drop-in fork of [react-transition-group](https://github.com/reactjs/react-transition-group) and part of [360 Bench](https://github.com/fitzyracing1/360-bench). It is based on upstream `react-transition-group@4.4.5`, and the API is unchanged. All credit for the original library goes to its authors and contributors.

## What the fork fixes (summary of [README.md](../README.md))

- No more `TypeError: findDOMNode is not a function` on React 19. The fork puts its own ref on the child and merges it with any existing ref.
- Behaviour on React 16.6, 17 and 18 is unchanged.
- Callbacks, timing and CSS class order are unchanged.

The full details and links to the upstream issues are in [README.md](../README.md).

Pages: [Getting started](getting-started.md) · [Architecture](architecture.md) · [Contributing](contributing.md)

## CI

`.github/workflows/ci.yml` runs on pushes and PRs to `master`/`alpha` (yarn test across React versions, docs-site build, dry-run release). The default branch here is `main`. A run is **lit** when it succeeds and **dark** otherwise.

## License

BSD-3-Clause. The original notice is kept: Copyright (c) 2018, React Community (forked from React, Copyright 2013-present, Facebook, Inc.).
Modifications: Copyright (c) 2026 Joshua Almeida.
