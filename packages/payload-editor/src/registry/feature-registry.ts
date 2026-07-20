import { featureOrder } from "./feature-order.js";
import { createBooleanFeature } from "../adapters/boolean.js";
import { createHeadingFeature } from "../adapters/heading.js";
import { createLinkFeature } from "../adapters/link.js";
import { createRelationshipFeature } from "../adapters/relationship.js";
import { createUploadFeature } from "../adapters/upload.js";

import type {
  EditorFeatureConfig,
  HeadingOptions,
  LinkOptions,
  NativeEditorFeature,
  RelationshipOptions,
  UploadOptions
} from "../types.js";

export function createManagedFeatures (config: Readonly<EditorFeatureConfig>): NativeEditorFeature[] {
  const providers: NativeEditorFeature[] = [];

  for (const key of featureOrder) {
    const value = config[key];
    if (!value) continue;
    if (key === "heading") providers.push(createHeadingFeature(value as true | Readonly<HeadingOptions>));
    else if (key === "link") providers.push(createLinkFeature(value as true | Readonly<LinkOptions>));
    else if (key === "upload") providers.push(createUploadFeature(value as true | Readonly<UploadOptions>));
    else if (key === "relationship") providers.push(createRelationshipFeature(value as true | Readonly<RelationshipOptions>));
    else providers.push(createBooleanFeature(key));
  }

  return providers;
}
