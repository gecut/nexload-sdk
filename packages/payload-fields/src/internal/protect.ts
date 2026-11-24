type ProtectedOverrides = { name?: string; type?: string };

export function assertProtected (overrides: ProtectedOverrides, name: string, type: string, label: string): void {
  if (overrides.name && overrides.name !== name) throw new Error(`${label} name is protected.`);
  if (overrides.type && overrides.type !== type) throw new Error(`${label} type is protected.`);
}
