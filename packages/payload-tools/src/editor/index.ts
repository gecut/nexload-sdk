import {
  EXPERIMENTAL_TableFeature,
  HorizontalRuleFeature,
  UploadFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  RelationshipFeature,
} from "@payloadcms/richtext-lexical";
import { RichTextAdapterProvider } from "payload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editor: RichTextAdapterProvider<any, any, any> = lexicalEditor({
  admin: {
    hideInsertParagraphAtEnd: true,
    hideGutter: true,
  },
  features: ({ defaultFeatures }) => {
    return [
      ...defaultFeatures,
      HeadingFeature({
        enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
      }),
      FixedToolbarFeature({ applyToFocusedEditor: true }),
      HorizontalRuleFeature(),
      UploadFeature(),
      EXPERIMENTAL_TableFeature(),
      RelationshipFeature({
        enabledCollections: ["products", "articles"],
      }),
    ];
  },
});
