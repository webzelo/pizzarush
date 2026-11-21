import { ObjectId } from "mongodb"

/** Returns null instead of throwing for malformed ids coming from the URL. */
export function toObjectId(value: string | null | undefined) {
  if (!value || !ObjectId.isValid(value)) {
    return null
  }

  return new ObjectId(value)
}
