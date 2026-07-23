# Migration

Move editor configuration to Payload Editor 1.1.0 without changing stored content.

**Topic:** migration
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/migration/
Payload Editor replaces repeated `lexicalEditor({ features })` assembly and the removed editor export from Payload Fields. It does not migrate stored Lexical JSON.
This page targets 1.1.0; use the
[package changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-editor/CHANGELOG.md)
to identify version-specific changes from your installed release.

## Incremental migration

1. Record the native provider keys and options currently used by one collection.
2. Choose the closest built-in preset or define an explicit custom preset.
3. Disable unwanted managed features.
4. Add project-owned providers through `extendFeatures`.
5. Attach the new provider to only that field.
6. Compare rendered editing controls and read existing content before migrating the next field.

```ts
// Before
lexicalEditor({ features: () => [ParagraphFeature(), BoldFeature()] })

// After
createEditor({ features: { paragraph: true, bold: true } })
```

Do not assume preset membership from its name; verify the current feature table. Blocks remain a native extension.

## Verification

Boot the Payload config, create/edit/read representative documents, compare generated types, and test any custom nodes or converters. Confirm relationship/upload permissions separately.

## Rollback

Keep the previous native editor factory available until content has been read and written successfully. Because this package does not rewrite stored JSON, rollback normally means restoring the old provider. If custom nodes changed their serialized shape, use the project's own content migration and backup plan.
