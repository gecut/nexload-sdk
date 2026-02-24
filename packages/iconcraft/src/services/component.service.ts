import prettier from "prettier";
import { SvgToJsx } from "../utils/svg-to-jsx";

export class ComponentService {
  private svgToJsx: SvgToJsx;

  constructor() {
    this.svgToJsx = new SvgToJsx();
  }

  async build(name: string, svg: string): Promise<string> {
    const jsx = this.svgToJsx.convert(svg);
    return await prettier.format(
      `"use client";

      import type * as React from "react";

      export function ${name}({ className, ...props }: React.SVGProps<SVGSVGElement>) {
        return (${jsx});
      }`,
      { parser: "typescript" }
    );
  }
}
