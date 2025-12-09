import { IconCraftOptions, IconMeta } from "../types";
import {
  FileService,
  NameService,
  IconifyService,
  ComponentService,
  MetaService,
} from "@/services";

export class IconCraftEngine {
  private fileService: FileService;
  private nameService: NameService;
  private iconifyService: IconifyService;
  private componentService: ComponentService;
  private metaService: MetaService;
  private options: IconCraftOptions;

  private constructor(options: IconCraftOptions) {
    this.options = options;
    this.fileService = new FileService(this.options.outDir);
    this.nameService = new NameService();
    this.iconifyService = new IconifyService();
    this.componentService = new ComponentService();
    this.metaService = new MetaService(this.options.outDir);
  }

  static async build(options: IconCraftOptions) {
    return new IconCraftEngine(options);
  }

  async addIcon(name: string): Promise<IconMeta> {
    const meta = this.nameService.normalize(name);
    const svg = await this.iconifyService.fetch(meta.collection, meta.icon);
    const component = await this.componentService.build(
      meta.componentName,
      svg
    );
    await this.fileService.create(meta.fileName, component);
    await this.metaService.add(name, meta);
    return meta;
  }

  async removeIcon(name: string): Promise<IconMeta | undefined> {
    const meta = await this.metaService.get(name);
    if (meta) {
      await this.fileService.remove(meta.fileName);
      await this.metaService.remove(name);
      return meta;
    }
  }

  async listIcons() {
    return this.metaService.getAll();
  }

  async sync() {
    const meta = await this.metaService.getAll();
    const files = await this.fileService.list();

    const metaFileNames = Object.values(meta).map((m) => `${m.fileName}.tsx`);
    const orphanedFiles = files.filter((f) => !metaFileNames.includes(f));

    for (const file of orphanedFiles) {
      await this.fileService.remove(file.replace(".tsx", ""));
    }

    const missingFiles = Object.values(meta).filter(
      (m) => !files.includes(`${m.fileName}.tsx`)
    );

    for (const m of missingFiles) {
      const svg = await this.iconifyService.fetch(m.collection, m.icon);
      const component = await this.componentService.build(m.componentName, svg);
      await this.fileService.create(m.fileName, component);
    }

    return { orphanedFiles, missingFiles };
  }
}
