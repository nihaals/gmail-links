#!/usr/bin/env bash

mkdir -p dist
sed "s/Version unknown/Version $CF_PAGES_COMMIT_SHA/" index.html > dist/index.html
