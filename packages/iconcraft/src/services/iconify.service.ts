
export class IconifyService {
  async fetch(pack: string, name: string): Promise<string> {
    const url = `https://api.iconify.design/${pack}/${name}.svg`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Icon "${pack}:${name}" not found`);

    return res.text();
  }
}
