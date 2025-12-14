export class SvgToJsx {
  /**
   * Converts an SVG string into a JSX-compatible string.
   * - Converts kebab-case attributes to camelCase.
   * - Converts inline styles to a JSX style object.
   * - Replaces all `class` attributes with `className`.
   * - If the root <svg> element has no class attribute, it injects `className={className}`
   *   to allow for easy styling from a parent component.
   * - Self-closes void SVG elements.
   *
   * @param svg The raw SVG string to convert.
   * @returns A string of the SVG converted to JSX.
   */
  convert(svg: string): string {
    if (!svg) return "";

    // Perform all standard SVG-to-JSX conversions.
    // This includes a global replacement of 'class' with 'className'.
    let jsx = svg
      .replace(/<\?xml.*?\?>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\bclass=/g, "className=")
      .replace(/([a-z]+)-([a-z]+)=/g, (match, p1, p2) => {
        // Exclude data-* and aria-* attributes from camel-casing
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

    // After the initial conversion, we check if the root <svg> tag has a 'className'.
    // This check happens *after* converting 'class' to 'className' globally.
    const hasRootClassName = /<svg[^>]*\sclassName=/.test(jsx);

    // If the root <svg> tag does NOT have a className, we inject one.
    // This makes the component easily styleable via props.
    if (!hasRootClassName) {
      jsx = jsx.replace(/<svg/, "<svg className={className}");
    }

    return jsx;
  }
}
