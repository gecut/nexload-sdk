import { IconCraftEngine } from "../core";
import { blueBright, bold, dim } from "colorette";
import ora from "ora";

export async function syncIcons(outDir?: string) {
  const spinner = ora({
    text: "Starting",
    indent: 2,
  }).start();

  try {
    const iconCraft = await IconCraftEngine.build({
      outDir: outDir || "icons",
    });

    spinner.text = "Syncing Icons";
    const { missingFiles, orphanedFiles } = await iconCraft.sync();

    for (const missingFile of missingFiles) {
      spinner.succeed(
        [
          dim("Added"),
          bold(missingFile.fileName),
          dim("→"),
          bold(
            `${dim("<")}${blueBright(missingFile.componentName)} ${dim("/>")}`
          ),
        ].join(" ")
      );
    }

    for (const orphanedFile of orphanedFiles) {
      spinner.succeed([dim("Removed"), bold(orphanedFile)].join(" "));
    }

    spinner.succeed([dim("Synced"), bold("icons")].join(" "));
  } catch (error: any) {
    spinner.fail(`Failed: ${error.message}`);
  }

  spinner.stop();
}
