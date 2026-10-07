/**
 * Runs the regular test suite against another React major.
 *
 *   REACT_COMPAT=19 npx jest -c jest.compat.config.js
 *
 * Each React version lives in its own folder under `test/compat/react<N>`
 * (install it once with `npm install --prefix test/compat/react<N>`), and jest
 * redirects every `react`, `react-dom` and `@testing-library/react` import there.
 * The default React (18) comes from the root devDependencies, see package.json.
 */
const path = require('path');
const pkg = require('./package.json');

const version = process.env.REACT_COMPAT;
if (!['16', '17', '19'].includes(version)) {
  throw new Error('Set REACT_COMPAT to 16, 17 or 19');
}

const modules = path.join(
  __dirname,
  'test',
  'compat',
  `react${version}`,
  'node_modules'
);

module.exports = {
  ...pkg.jest,
  rootDir: __dirname,
  displayName: `react-${version}`,
  moduleNameMapper: {
    '^react$': path.join(modules, 'react'),
    '^react/(.*)$': path.join(modules, 'react', '$1'),
    '^react-dom$': path.join(modules, 'react-dom'),
    '^react-dom/(.*)$': path.join(modules, 'react-dom', '$1'),
    '^@testing-library/react$': path.join(modules, '@testing-library/react'),
    '^@testing-library/react/(.*)$': path.join(
      modules,
      '@testing-library/react',
      '$1'
    ),
  },
};
