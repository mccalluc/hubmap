#!/usr/bin/env bash
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

(( $# == 1 )) || die "Requires one argument, the staging URL to be copied to vitessce.io; Instead got $#."
S3_BASE='//s3.amazonaws.com/'
S3_BUCKET='vitessce-data'
S3_PATH='/docs-root/'
RE="$S3_BASE$S3_BUCKET$S3_PATH"
[[ "$@" =~ "$RE" ]] || die "Expected URL to match $RE"
S3_SRC_PATH=$( echo "$@" | perl -pne 's{^.*'"$S3_BASE"'}{}; s{/index.html}{}; s{/$}{}' )

S3_SRC="s3://$S3_SRC_PATH"
S3_TARGET='s3://beta.vitessce.io'

b=$(tput bold)
n=$(tput sgr0)
read -p "Are you sure you want to clear $b$S3_TARGET$n and copy $b$S3_SRC$n to it? [y/n]" -n 1 -r
echo # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  aws s3 rm --recursive $S3_TARGET
  aws s3 cp --acl public-read \
            --recursive \
            $S3_SRC $S3_TARGET
  open http://beta.vitessce.io
  echo 'Done. NOTE: Your browser may have cached an older verion; Reload if necessary.'
fi
