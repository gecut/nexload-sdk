import type {
  FeatureProviderServer,
  LexicalEditorProps
} from "@payloadcms/richtext-lexical";
import type { CollectionSlug, UploadCollectionSlug } from "payload";

// Payload's heterogeneous FeaturesInput contract uses these generic any slots.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NativeEditorFeature = FeatureProviderServer<any, any, any>;

export type EditorPresetName
  = | "compact"
    | "standard"
    | "structured-content"
    | "article"
    | "product-description";

export type FeatureOption<TOptions = never> = [TOptions] extends [never]
  ? boolean
  : boolean | Readonly<TOptions>;

export type HeadingSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingOptions { sizes?: readonly HeadingSize[] }

export interface RelationalOptions<TSlug extends string> {
  allowedCollections?: readonly TSlug[]
  maxDepth?: number
}

export interface LinkOptions extends RelationalOptions<CollectionSlug> { autoLink?: boolean }

export type UploadOptions = RelationalOptions<UploadCollectionSlug>;
export type RelationshipOptions = RelationalOptions<CollectionSlug>;

export interface EditorFeatureConfig {
  paragraph?: FeatureOption
  heading?: FeatureOption<HeadingOptions>
  bold?: FeatureOption
  italic?: FeatureOption
  underline?: FeatureOption
  strikethrough?: FeatureOption
  inlineCode?: FeatureOption
  link?: FeatureOption<LinkOptions>
  unorderedList?: FeatureOption
  orderedList?: FeatureOption
  blockquote?: FeatureOption
  horizontalRule?: FeatureOption
  upload?: FeatureOption<UploadOptions>
  relationship?: FeatureOption<RelationshipOptions>
  inlineToolbar?: FeatureOption
  fixedToolbar?: FeatureOption
}

declare const editorPresetBrand: unique symbol;

export interface EditorPreset {
  readonly [editorPresetBrand]: true
  readonly features: Readonly<EditorFeatureConfig>
}

export interface DefineEditorPresetOptions { readonly features: Readonly<EditorFeatureConfig> }

interface CommonEditorOptions {
  readonly admin?: LexicalEditorProps["admin"]
  readonly extendFeatures?: readonly NativeEditorFeature[]
}

export type CreateEditorOptions = CommonEditorOptions & (
  | {
    readonly preset: EditorPresetName | EditorPreset
    readonly features?: Readonly<EditorFeatureConfig>
  }
  | {
    readonly preset?: never
    readonly features: Readonly<EditorFeatureConfig>
  }
);
