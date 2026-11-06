/**
 * Checks if the selected set of radicals exactly matches the target radicals
 * required to forge a Kanji (regardless of selection order).
 */
export function canCraftKanji(selectedRadicals: string[], targetRadicals: string[]): boolean {
  if (selectedRadicals.length !== targetRadicals.length) {
    return false;
  }

  const sortedSelected = [...selectedRadicals].sort();
  const sortedTarget = [...targetRadicals].sort();

  return sortedSelected.every((rad, index) => rad === sortedTarget[index]);
}

/**
 * Checks whether the currently selected radicals are a valid partial subset
 * of the required radicals (helping guide the user without failing prematurely).
 */
export function isValidRadicalSubset(selectedRadicals: string[], targetRadicals: string[]): boolean {
  const targetCounts: Record<string, number> = {};
  for (const rad of targetRadicals) {
    targetCounts[rad] = (targetCounts[rad] || 0) + 1;
  }

  for (const rad of selectedRadicals) {
    if (!targetCounts[rad] || targetCounts[rad] <= 0) {
      return false;
    }
    targetCounts[rad]--;
  }

  return true;
}
