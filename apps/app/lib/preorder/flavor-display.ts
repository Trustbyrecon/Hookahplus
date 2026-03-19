/**
 * Resolve flavor wheel IDs to display labels for operator-facing session.flavor / flavorMix.
 */

const CATEGORY_ITEMS: Array<{ id: string; label: string }> = [
  { id: 'mint', label: 'Classic Mint' },
  { id: 'ice-mint', label: 'Ice Mint' },
  { id: 'spearmint', label: 'Spearmint' },
  { id: 'menthol', label: 'Menthol Burst' },
  { id: 'mango', label: 'Mango' },
  { id: 'peach', label: 'Peach' },
  { id: 'watermelon', label: 'Watermelon' },
  { id: 'grape', label: 'Grape' },
  { id: 'berry', label: 'Mixed Berry' },
  { id: 'lemon', label: 'Lemon' },
  { id: 'orange', label: 'Orange' },
  { id: 'lime', label: 'Lime' },
  { id: 'tangerine', label: 'Tangerine' },
  { id: 'vanilla', label: 'Vanilla' },
  { id: 'caramel', label: 'Caramel' },
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'cookie', label: 'Cookie Dough' },
  { id: 'double-apple', label: 'Double Apple' },
  { id: 'cinnamon', label: 'Cinnamon' },
  { id: 'cardamom', label: 'Cardamom' },
  { id: 'anise', label: 'Anise' },
  { id: 'rose', label: 'Rose' },
  { id: 'jasmine', label: 'Jasmine' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'vodka-infused', label: 'Vodka-Infused' },
  { id: 'whiskey-barrel', label: 'Whiskey Barrel' },
  { id: 'boutique-import', label: 'Boutique Import' },
];

const ID_TO_LABEL = new Map(CATEGORY_ITEMS.map((x) => [x.id, x.label]));

export function flavorIdToDisplayLabel(
  id: string,
  customFlavors: string[] | undefined
): string {
  if (id.startsWith('custom-')) {
    const idx = parseInt(id.replace('custom-', ''), 10);
    if (!Number.isNaN(idx) && customFlavors?.[idx]) {
      return customFlavors[idx];
    }
    return id;
  }
  return ID_TO_LABEL.get(id) || id;
}

export function flavorIdsToDisplayLabels(
  ids: string[],
  customFlavors: string[] | undefined
): string[] {
  return ids.map((id) => flavorIdToDisplayLabel(id, customFlavors));
}
