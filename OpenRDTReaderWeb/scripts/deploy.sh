#!/bin/bash

set -euo pipefail 
umask 077
SELF_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
VALID_PROJECTS="staging|sandbox|prod"

function set_build_vars {
  source $SELF_DIR/../config/sentry-config
  export SENTRY_DSN="https://${SENTRY_KEY}@sentry.io/${PROJECT_ID}"
  export SENTRY_ENVIRONMENT=$PROJECT
  export SENTRY_ORG="audere"
  export SENTRY_PROJECT=$PROJECT_NAME
  export SENTRY_RELEASE=$(yarn run --silent sentry-cli releases propose-version)
  export REACT_APP_SENTRY_DSN=$SENTRY_DSN
  export REACT_APP_SENTRY_RELEASE=$SENTRY_RELEASE
  export REACT_APP_ENVIRONMENT=$PROJECT
}

function upload_source_maps {
  source $SELF_DIR/../config/sentry-config

  yarn sentry-cli releases new $SENTRY_RELEASE
  yarn sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps \
      --url-prefix '~/static/js' --no-rewrite build/static/js
  yarn sentry-cli releases finalize $SENTRY_RELEASE
}

function build_frontend_project {
  yarn install --frozen-lockfile
  set_build_vars
  yarn build
  firebase deploy --project "$PROJECT"
  upload_source_maps
}

function tag_deploy {
  NOW="$(TZ='America/Los_Angeles' date +%Y%m%d_%H%M%S)"
  TAGNAME="${PROJECT}_${NOW}"
  # Need to set git user for CI
  git config --get user.name || git config user.name "auderedev"
  git config --get user.email || git config user.email "ios-dev@auderenow.org"
  git tag -a "$TAGNAME" -m "Deploy script tagging successful deploy"
  git push origin "$TAGNAME"
}

if [[ "$#" -ne 1 || ! "$1" =~ ($VALID_PROJECTS)$ ]]; then
  echo "Error: First argument must be one of $VALID_PROJECTS"
  exit 1
fi 
PROJECT="$1"

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Cannot deploy. You have uncommitted changes; please commit first."
  git status
  exit 1
fi

cd $SELF_DIR/../
build_frontend_project

tag_deploy
