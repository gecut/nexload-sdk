function isPlainObject (value: object): value is Record<PropertyKey, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function cloneConfig<TValue> (value: TValue): TValue {
  if (Array.isArray(value)) return value.map((item) => cloneConfig(item)) as TValue;
  if (value === null || typeof value !== "object" || !isPlainObject(value)) return value;

  const clone = Object.create(Object.getPrototypeOf(value)) as Record<PropertyKey, unknown>;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value, key
    );
    if (!descriptor) continue;
    if ("value" in descriptor) descriptor.value = cloneConfig(descriptor.value);
    Object.defineProperty(
      clone, key, descriptor
    );
  }
  return clone as TValue;
}
