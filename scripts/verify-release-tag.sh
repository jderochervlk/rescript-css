#!/usr/bin/env bash
set -euo pipefail

tag="v${VERSION}"
tag_reference="$(gh api "repos/${GITHUB_REPOSITORY}/git/matching-refs/tags/${tag}" --jq "map(select(.ref == \"refs/tags/${tag}\")) | if length == 0 then \"\" else .[0].object.type + \" \" + .[0].object.sha end")"

if [ -z "${tag_reference}" ]; then
  if [ "${1:-}" = "--create" ]; then
    gh api --method POST "repos/${GITHUB_REPOSITORY}/git/refs" \
      -f ref="refs/tags/${tag}" \
      -f sha="${GITHUB_SHA}" >/dev/null
  fi
  exit 0
fi

tag_type="${tag_reference%% *}"
tag_sha="${tag_reference#* }"
if [ "${tag_type}" = "tag" ]; then
  tag_target="$(gh api "repos/${GITHUB_REPOSITORY}/git/tags/${tag_sha}" --jq '.object.type + " " + .object.sha')"
  tag_type="${tag_target%% *}"
  tag_sha="${tag_target#* }"
fi

if [ "${tag_type}" != "commit" ]; then
  printf 'Tag %s has unsupported target type %s.\n' "${tag}" "${tag_type}"
  exit 1
fi
if [ "${tag_sha}" != "${GITHUB_SHA}" ]; then
  printf 'Tag %s targets %s, but this run builds %s.\n' "${tag}" "${tag_sha}" "${GITHUB_SHA}"
  exit 1
fi
