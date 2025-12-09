
export class SvgToJsx {
  convert(svg: string): string {
    if (!svg) return "";

    return svg
      .replace(/<\?xml.*?\?>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\bclass=/g, "className=")
      .replace(/([a-z]+)-([a-z]+)=/g, (match, p1, p2) => {
        if (p1 === "data" || p1 === "aria") return match;
        return `${p1}${p2.charAt(0).toUpperCase() + p2.slice(1)}=`;
      })
      .replace(/style="([^"]*)"/g, (_, styleString) => {
        const styleObj = styleString
          .split(";")
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [key, val] = s.split(":");
            if (!key || !val) return "";
            const camelKey = key
              .trim()
              .replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
            return `${camelKey}: '${val.trim()}'`;
          })
          .join(", ");

        return `style={{ ${styleObj} }}`;
      })
      .replace(
        /<(path|rect|circle|polygon|line|polyline|ellipse|stop)([^>]*)(?<!\/)>/g,
        "<$1$2 />"
      )
      .trim();
  }
}
