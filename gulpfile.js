const { src, dest } = require('gulp');
const path = require('path');

function buildIcons() {
  // Copy icons to nodes directory with folder structure
  src('nodes/**/*.{png,svg}')
    .pipe(dest('dist/nodes/'));
  
  // Copy just the ministryplatform.svg to credentials directory (flattened)
  return src('nodes/MinistryPlatform/ministryplatform.svg')
    .pipe(dest('dist/credentials/'));
}

exports.build = buildIcons;
exports['build:icons'] = buildIcons;
