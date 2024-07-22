#!/usr/bin/env bash

set -euo pipefail

mkdir -p dist
mv src/*.{html,js} dist
sed -i "s/Version unknown/Version $CF_PAGES_COMMIT_SHA/" dist/index.html
