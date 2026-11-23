import type { Filter, ObjectId } from "mongodb"

import type { UserDoc } from "@/lib/collections"
import { toObjectId } from "@/lib/object-id"

type IdDocument = {
  _id: ObjectId | string
}

/**
 * Builds a filter that matches both ObjectId-backed documents created by
 * Better Auth's MongoDB adapter and legacy documents that stored `_id` as a
 * string. Application code receives Better Auth user ids as hex strings.
 */
export function mongoIdFilter(id: string): Filter<IdDocument> {
  const objectId = toObjectId(id)

  if (!objectId) {
    return { _id: id }
  }

  return {
    $or: [{ _id: objectId }, { _id: id }],
  }
}

/** Typed filter for raw updates/queries against the Better Auth `user` collection. */
export function userIdFilter(id: string): Filter<UserDoc> {
  return mongoIdFilter(id) as unknown as Filter<UserDoc>
}
