export async function resolveEditor(editor) {
  return editor({
    config: {
      collections: [],
      globals: [],
      i18n: { translations: {} },
      localization: false,
    },
    isRoot: true,
    parentIsLocalized: false,
  });
}

export function featureMap(adapter) {
  return new Map(adapter.features.map((feature) => [feature.key, feature.serverFeatureProps]));
}
