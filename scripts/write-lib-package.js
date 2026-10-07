/**
 * Writes lib/package.json, the manifest of the published package.
 *
 * Upstream published `lib/` with semantic-release-alt-publish-dir. This fork
 * builds it by hand: `npm run build`, then `npm pack` / `npm publish` inside
 * `lib/`. Never publish the repository root.
 */
const fs = require('fs');
const path = require('path');

const root = require('../package.json');

const keep = [
  'name',
  'version',
  'description',
  'repository',
  'keywords',
  'author',
  'contributors',
  'license',
  'bugs',
  'homepage',
  'peerDependencies',
  'dependencies',
  'browserify',
  'sideEffects',
  'publishConfig',
];

const pkg = {};
for (const key of keep) {
  if (key === 'repository') {
    pkg.main = 'cjs/index.js';
    pkg.module = 'esm/index.js';
  }
  if (root[key] !== undefined) pkg[key] = root[key];
}

const libDir = path.join(__dirname, '..', 'lib');
fs.writeFileSync(
  path.join(libDir, 'package.json'),
  JSON.stringify(pkg, null, 2) + '\n'
);
console.log(`wrote lib/package.json for ${pkg.name}@${pkg.version}`);
