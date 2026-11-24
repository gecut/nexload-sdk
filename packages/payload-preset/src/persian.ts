import type { Config, Locale, Plugin, Timezone } from "payload";

import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";

import { TEHRAN_TIME_ZONE } from "@nexload-sdk/persian/date";

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

type Localization = Exclude<Config["localization"], false | undefined>;

function isStringLocales(
  localization: Localization,
): localization is Extract<Localization, { locales: string[] }> {
  return localization.locales.every((l: unknown) => typeof l === "string");
}

function mapLocale(locale: Locale): Locale {
  if (locale.code === "fa" && locale.rtl === undefined) {
    return { ...locale, rtl: true };
  }

  return locale;
}

function mapLocalization(
  localization: Config["localization"],
): Config["localization"] {
  if (!localization) {
    return undefined;
  }

  if (isStringLocales(localization)) {
    return localization;
  }

  return {
    ...localization,
    locales: localization.locales.map(mapLocale),
  };
}

function resolveSupportedTimezones(
  supported?:
    | Timezone[]
    | ((args: { defaultTimezones: Timezone[] }) => Timezone[]),
) {
  if (Array.isArray(supported)) {
    return withTehran(supported);
  }

  return (args: { defaultTimezones: Timezone[] } = { defaultTimezones: [] }): Timezone[] => {
    const { defaultTimezones } = args;
    const base = typeof supported === "function"
      ? supported(args)
      : defaultTimezones;

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
