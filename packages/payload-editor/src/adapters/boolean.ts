import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature
} from "@payloadcms/richtext-lexical";

import type { ManagedFeatureKey } from "../registry/types.js";
import type { NativeEditorFeature } from "../types.js";

type BooleanFeatureKey = Exclude<
  ManagedFeatureKey,
  "heading" | "link" | "upload" | "relationship"
>;

const factories: Record<BooleanFeatureKey, () => NativeEditorFeature> = {
  paragraph: ParagraphFeature,
  bold: BoldFeature,
  italic: ItalicFeature,
  underline: UnderlineFeature,
  strikethrough: StrikethroughFeature,
  inlineCode: InlineCodeFeature,
  unorderedList: UnorderedListFeature,
  orderedList: OrderedListFeature,
  blockquote: BlockquoteFeature,
  horizontalRule: HorizontalRuleFeature,
  inlineToolbar: InlineToolbarFeature,
  fixedToolbar: FixedToolbarFeature,
};

export function createBooleanFeature (key: BooleanFeatureKey): NativeEditorFeature {
  return factories[key]();
}
