import { LinkFeature } from "@payloadcms/richtext-lexical";

import type { LinkOptions, NativeEditorFeature } from "../types.js";

export function createLinkFeature (options: true | Readonly<LinkOptions>): NativeEditorFeature {
  if (options === true) return LinkFeature();
  return LinkFeature({
    disableAutoLinks: options.autoLink === undefined ? undefined : options.autoLink ? undefined : true,
    enabledCollections: options.allowedCollections ? [...options.allowedCollections] : undefined,
    maxDepth: options.maxDepth,
  });
}
