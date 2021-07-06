#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }
# Race condition truncates logs on Travis: "sleep" might help.
# https://github.com/travis-ci/travis-ci/issues/6018

PATH=$PATH:`npm bin`

start changelog
if [ "$GITHUB_REF" != 'refs/heads/master' ]; then
  diff CHANGELOG.md <(curl https://raw.githubusercontent.com/vitessce/vitessce/master/CHANGELOG.md) \
    && die 'Update CHANGELOG.md'
fi
end changelog

start lint
eslint src || die 'eslint failed; try: npm run lint-fix'
end lint

start test
npm test
end test

start cypress
# Cypress fails randomly on GH Actions so we only run this locally.
if [ "$CI" != 'true' ]; then
  npm start & wait-on http://localhost:3000/
  npm run cypress:run
  echo 'NOTE: Server is still running.'
fi
end cypress

start schema
./src/schemas/schema-schema.sh
end schema

start build
npm run build:prod
node ./scripts/verify-build.js
end build
