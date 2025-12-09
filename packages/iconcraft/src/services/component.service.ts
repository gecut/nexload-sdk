
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
      
      export default function ${name}(){return (${jsx})}`,
      { parser: "babel" }
    );
  }
}
