const { src, dest, parallel } = require('gulp');

function buildNodesIcons() {
  return src('nodes/**/*.{png,svg}')
    .pipe(dest('dist/nodes/'));
}

function buildCredentialsIcons() {
  return src('nodes/MinistryPlatform/ministryplatform.svg')
    .pipe(dest('dist/credentials/'));
}

const buildIcons = parallel(buildNodesIcons, buildCredentialsIcons);

exports.build = buildIcons;
exports['build:icons'] = buildIcons;
