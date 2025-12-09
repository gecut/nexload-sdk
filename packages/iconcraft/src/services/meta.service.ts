
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { IconMeta, Registry } from "../types";

export class MetaService {
  private metaFilePath: string;

  constructor(private outDir: string) {
    this.metaFilePath = resolve(process.cwd(), this.outDir, ".ic-meta.json");
  }

  private async read(): Promise<Registry> {
    try {
      const raw = await readFile(this.metaFilePath, "utf8");
      return JSON.parse(raw);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {};
      } else {
        throw error;
      }
    }
  }

  private async write(registry: Registry): Promise<void> {
    await writeFile(this.metaFilePath, JSON.stringify(registry), "utf8");
  }

  async add(name: string, meta: IconMeta): Promise<void> {
    const registry = await this.read();
    registry[name] = meta;
    await this.write(registry);
  }

  async remove(name: string): Promise<void> {
    const registry = await this.read();
    delete registry[name];
    await this.write(registry);
  }

  async get(name: string): Promise<IconMeta | undefined> {
    const registry = await this.read();
    return registry[name];
  }

  async getAll(): Promise<Registry> {
    return this.read();
  }
}
