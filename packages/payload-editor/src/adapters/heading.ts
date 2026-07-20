import { HeadingFeature } from "@payloadcms/richtext-lexical";

import type { HeadingOptions, NativeEditorFeature } from "../types.js";

export function createHeadingFeature (options: true | Readonly<HeadingOptions>): NativeEditorFeature {
  return options === true
    ? HeadingFeature()
    : HeadingFeature({ enabledHeadingSizes: options.sizes ? [...options.sizes] : undefined, });
}
