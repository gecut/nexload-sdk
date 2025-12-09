
export interface IconCraftOptions {
  outDir: string;
}

export interface IconMeta {
  collection: string;
  icon: string;
  fileName: string;
  componentName: string;
}

export type Registry = Record<string, IconMeta>;
