import { IconCraftEngine } from "@/core";
import { blueBright, bold, dim, greenBright } from "colorette";
import ora from "ora";

export async function addIcon(name?: string, outDir?: string) {
  const spinner = ora({
    text: "Starting",
    indent: 2,
  }).start();

  try {
    const iconCraft = await IconCraftEngine.build({
      outDir: outDir || "icons",
    });

    spinner.text = "Fetching Icon";
    const meta = await iconCraft.addIcon(name!);

    if (!meta) {
      throw new Error("Failed to add icon");
    }

    const { componentName, fileName } = meta;

    spinner.succeed(
      [
        dim("Added"),
        bold(name!),
        dim("→"),
        bold(`${dim("<")}${blueBright(componentName)} ${dim("/>")}`),
      ].join(" ")
    );
    spinner.info(
      [
        blueBright("import"),
        componentName!,
        blueBright("from"),
        greenBright(`'${fileName}'`) + ";",
      ].join(" ")
    );
  } catch (error: any) {
    spinner.fail(`Failed: ${error.message}`);
  }

  spinner.stop();
}
