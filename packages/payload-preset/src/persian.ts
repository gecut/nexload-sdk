import type { Config, Plugin } from "payload";

import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";

import { TEHRAN_TIME_ZONE } from "@nexload-sdk/persian/date";

type Timezone = { label: string; value: string };

const tehran: Timezone = { label: "تهران", value: TEHRAN_TIME_ZONE };

function withTehran(zones: Timezone[]): Timezone[] {
  return zones.some((zone) => zone.value === TEHRAN_TIME_ZONE) ? [...zones] : [...zones, tehran];
}

function mergeI18n(i18n: Config["i18n"]): Config["i18n"] {
  return {
    ...i18n,
    supportedLanguages: {
      ...(i18n?.supportedLanguages ?? { en }),
      fa: i18n?.supportedLanguages?.fa ?? fa,
    },
    fallbackLanguage: i18n?.fallbackLanguage ?? "fa",
  };
}

function mapLocale(locale: unknown): unknown {
  if (typeof locale === "object" && locale !== null) {
    const loc = locale as Record<string, unknown>;

    if (loc.code === "fa" && loc.rtl === undefined) {
      return { ...loc, rtl: true };
    }
  }

  return locale;
}

function mapLocalization(
  localization: Config["localization"],
): Config["localization"] | undefined {
  if (!localization) {
    return undefined;
  }

  const locales = (localization.locales as unknown[]).map(mapLocale);

  return {
    ...localization,
    locales,
  } as Config["localization"];
}

function resolveSupportedTimezones(
  supported?:
    | Timezone[]
    | ((args: { defaultTimezones: Timezone[] }) => Timezone[]),
) {
  if (Array.isArray(supported)) {
    return withTehran(supported);
  }

  return (args?: { defaultTimezones?: Timezone[] }) => {
    const fallback = args?.defaultTimezones ?? [];
    const base = typeof supported === "function"
      ? supported(args as { defaultTimezones: Timezone[] })
      : fallback;

    return withTehran(base);
  };
}

function resolveAdmin(admin: Config["admin"]): Config["admin"] {
  const timezones = admin?.timezones;
  const supported = timezones?.supportedTimezones;

  return {
    ...admin,
    timezones: {
      ...timezones,
      defaultTimezone: timezones?.defaultTimezone ?? TEHRAN_TIME_ZONE,
      supportedTimezones: resolveSupportedTimezones(supported),
    },
  };
}

export function persianPlugin(): Plugin {
  return (config) => {
    const localization = mapLocalization(config.localization);

    return {
      ...config,
      i18n: mergeI18n(config.i18n),
      ...(localization ? { localization } : {}),
      admin: resolveAdmin(config.admin),
    };
  };
}
