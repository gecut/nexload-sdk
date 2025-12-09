import { resolve } from "node:path";
import { mkdir, writeFile, rm, readdir } from "node:fs/promises";

export class FileService {
  constructor(private outDir: string) {}

  private async sanitizeOutDir(): Promise<string> {
    const _outDir = resolve(process.cwd(), this.outDir);
    try {
      await mkdir(_outDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
    return _outDir;
  }

  async create(fileName: string, content: string): Promise<void> {
    const outDir = await this.sanitizeOutDir();
    const outPath = resolve(outDir, `${fileName}.tsx`);
    await writeFile(outPath, content, "utf8");
  }

  async remove(fileName: string): Promise<void> {
    const outDir = await this.sanitizeOutDir();
    const outPath = resolve(outDir, `${fileName}.tsx`);
    await rm(outPath);
  }

  async list(): Promise<string[]> {
    const outDir = await this.sanitizeOutDir();
    const files = await readdir(outDir);

    return files.filter((f) => f.endsWith(".tsx"));
  }
}
