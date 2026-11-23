import { favoritesCollection } from "@/lib/collections"

/** Ids only: enough to render saved-state icons without loading whole items. */
export async function getFavoriteItemIds(userId: string): Promise<string[]> {
  const rows = await favoritesCollection
    .find({ userId })
    .project<{ itemId: string }>({ itemId: 1 })
    .toArray()

  return rows.map((row) => row.itemId)
}
