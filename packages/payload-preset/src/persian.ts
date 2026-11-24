import type { Plugin } from "payload";

import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";

import { TEHRAN_TIME_ZONE } from "@nexload-sdk/persian/date";

const tehran = { label: "تهران", value: TEHRAN_TIME_ZONE, };

function withTehran (zones: { label: string, value: string }[]) {
  return zones.some((zone) => zone.value === TEHRAN_TIME_ZONE) ? [...zones] : [...zones, tehran];
}

export function persianPlugin (): Plugin {
  return (config) => {
    const timezones = config.admin?.timezones;
    const supported = timezones?.supportedTimezones;

    return {
      ...config,
      i18n: {
        ...config.i18n,
        supportedLanguages: { ...(config.i18n?.supportedLanguages ?? { en, }), fa: config.i18n?.supportedLanguages?.fa ?? fa, },
        fallbackLanguage: config.i18n?.fallbackLanguage ?? "fa",
      },
      ...(config.localization && config.localization.locales.every((locale) => typeof locale !== "string") ? { localization: {
        ...config.localization,
        locales: config.localization.locales.map((locale) => locale.code === "fa" && locale.rtl === undefined
          ? { ...locale, rtl: true, }
          : locale),
      }, } : {}),
      admin: {
        ...config.admin,
        timezones: {
          ...timezones,
          defaultTimezone: timezones?.defaultTimezone ?? TEHRAN_TIME_ZONE,
          supportedTimezones: Array.isArray(supported)
            ? withTehran(supported)
            : (args) => withTehran(supported ? supported(args) : args.defaultTimezones),
        },
      },
    };
  };
}
