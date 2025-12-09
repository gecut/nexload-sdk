
import { kebabCase, pascalCase } from "change-case";
import { IconMeta } from "../types";

export class NameService {
  normalize(input?: string): IconMeta {
    if (!input || !input.includes(":")) {
      throw new Error("Usage: iconcraft add <collection:name>");
    }

    const [rawCollection, rawIcon] = input.split(":");

    if (!rawCollection || !rawIcon) {
      throw new Error("Usage: iconcraft add <collection:name>");
    }

    const collection = kebabCase(rawCollection).trim();
    const icon = kebabCase(rawIcon).trim();
    const fileName = kebabCase(`${collection} ${icon}`);
    const componentName = pascalCase(`${collection} ${icon} icon`).replaceAll(
      "_",
      ""
    );

    return {
      collection,
      icon,
      fileName,
      componentName,
    };
  }
}
