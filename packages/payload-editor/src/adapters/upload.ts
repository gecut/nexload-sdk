import { UploadFeature } from "@payloadcms/richtext-lexical";

import type { NativeEditorFeature, UploadOptions } from "../types.js";

export function createUploadFeature (options: true | Readonly<UploadOptions>): NativeEditorFeature {
  if (options === true) return UploadFeature();
  return UploadFeature({
    enabledCollections: options.allowedCollections ? [...options.allowedCollections] : undefined,
    maxDepth: options.maxDepth,
  });
}
