#!/usr/bin/env bash
# Checks out the open datasets that scripts/build-content.ts reads.
# See ATTRIBUTION.md for the licence of each source.
set -euo pipefail
DIR="${1:-.data-sources}"
mkdir -p "$DIR"
clone() {
  local repo="$1" name="$2"
  if [ -d "$DIR/$name/.git" ]; then
    echo "== $name already present, pulling"
    git -C "$DIR/$name" pull --depth 1 --ff-only -q || true
  else
    echo "== cloning $repo"
    git clone --depth 1 -q "https://github.com/$repo" "$DIR/$name"
  fi
}
clone KanjiVG/kanjivg kanjivg                              # CC BY-SA 3.0 - stroke paths
clone davidluzgouveia/kanji-data kanji-data                # MIT repo; KANJIDIC2 (CC BY-SA 4.0) + Waller JLPT (CC BY)
clone jamsinclair/open-anki-jlpt-decks open-anki-jlpt-decks # MIT repo; vocabulary from tanos.co.uk (CC BY)
echo "Done. Now run: npx tsx scripts/build-content.ts"
