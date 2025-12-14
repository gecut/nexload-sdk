export class SvgToJsx {
  /**
   * Converts an SVG string into a JSX-compatible string.
   * - Converts kebab-case attributes to camelCase.
   * - Converts inline styles to a JSX style object.
   * - Replaces all `class` attributes with `className`.
   * - If the root <svg> element has no class attribute, it injects `className={className}`.
   * - Injects `{...props}` into the root <svg> element for prop drilling.
   * - Self-closes void SVG elements.
   *
   * @param svg The raw SVG string to convert.
   * @returns A string of the SVG converted to JSX.
   */
  convert(svg: string): string {
    if (!svg) return "";

    // Perform all standard SVG-to-JSX conversions.
    let jsx = svg
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

    // Check if the root <svg> tag has a className after initial conversion.
    const hasRootClassName = /<svg[^>]*\sclassName=/.test(jsx);

    // If not, inject `className={className}` to make it styleable.
    if (!hasRootClassName) {
      jsx = jsx.replace(/<svg/, "<svg className={className}");
    }

    // Finally, inject {...props} into the <svg> tag for full flexibility.
    // This targets the first closing bracket '>' which belongs to the opening <svg> tag.
    jsx = jsx.replace(">", " {...props}>");

    return jsx;
  }
}
