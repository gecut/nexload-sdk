# Native seam

`extendFeatures` accepts Payload `FeatureProviderServer` values. Managed providers are compiled first in canonical order, then native providers append in caller order.

Provider keys must be non-empty and unique. To replace `link`, for example, set `features.link: false` and append the native `link` provider. Nexload does not expose callbacks that can reorder or rewrite managed providers.
