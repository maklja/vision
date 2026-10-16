#!/usr/bin/env bash
set -euo pipefail

build_dir="${1:-pages-viewer}"
docs_dir="${2:-docs}"

test -s "$build_dir/index.html"

# Checkout and artifact extraction can give different HTML the same size and timestamp.
# Compare contents so the new entry document always accompanies its hashed assets.
rsync -a --checksum --delete "$build_dir/" "$docs_dir/"

# The source artifact passed the browser tests. Require an exact copy before publishing,
# including every chunk and Worker, then add the GitHub Pages marker.
diff --recursive --brief "$build_dir/" "$docs_dir/"
touch "$docs_dir/.nojekyll"
