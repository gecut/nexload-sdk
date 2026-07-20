import { RelationshipFeature } from "@payloadcms/richtext-lexical";

import type { NativeEditorFeature, RelationshipOptions } from "../types.js";

export function createRelationshipFeature (options: true | Readonly<RelationshipOptions>): NativeEditorFeature {
  if (options === true) return RelationshipFeature();
  return RelationshipFeature({
    enabledCollections: options.allowedCollections ? [...options.allowedCollections] : undefined,
    maxDepth: options.maxDepth,
  });
}
